import { InternalCompilerError } from "../../errors.js";
import {
  emitBytesHeaderLength,
  emitBytesSharedStorage,
  emitBytesReadOnlyShared,
  noteBytesReceiver,
} from "./expr-bytes.js";
import type { LibCallExpr, LlValue, LlvmEmitterContext } from "./expr-context.js";
import { emitBorrowedInputs } from "./borrowed-inputs.js";

/** Narrow only exact binary32 values and explicit rounding boundaries.
 * A product of binary32 operands is exact in binary64. A binary64 sum or
 * difference of them rounds to the same binary32 as the direct operation.
 * Division and sqrt deliberately keep the existing binary64 path here. */
export function emitProvenFloat32Math(host: LlvmEmitterContext, expr: LibCallExpr): LlValue | null {
  const exact = (value: (typeof expr.args)[number]): boolean =>
    host.float32Values.isValue(value, host.currentFunctionName);
  if ((expr.fn === "math.min" || expr.fn === "math.max") && expr.args.every(exact))
    return emitFloat32Math(host, {
      ...expr,
      fn: expr.fn === "math.min" ? "math.f32Min" : "math.f32Max",
    });
  const value = expr.args[0];
  if (
    expr.fn === "math.fround" &&
    value?.kind === "bin" &&
    exact(value.left) &&
    exact(value.right)
  ) {
    const fn =
      value.op === "+"
        ? "math.f32Add"
        : value.op === "-"
          ? "math.f32Sub"
          : value.op === "*"
            ? "math.f32Mul"
            : null;
    if (fn) return emitFloat32Math(host, { ...expr, fn, args: [value.left, value.right] });
  }
  return null;
}

/** Binary32 computation is explicit: ordinary numeric IR keeps its existing
 * double ABI. Extensions/truncations disappear between chained operations
 * after LLVM optimization; no fast-math or contraction flags are used. */
export function emitFloat32Math(host: LlvmEmitterContext, expr: LibCallExpr): LlValue {
  const B = host.B;
  const arguments_ = expr.args.map((argument) => host.emitExpr(argument));
  const operands = arguments_.map((argument) => {
    const value = B.tmp();
    B.line(`${value} = fptrunc double ${argument.name} to float`);
    return value;
  });
  const value = B.tmp();
  const binary = {
    "math.f32Add": "fadd",
    "math.f32Sub": "fsub",
    "math.f32Mul": "fmul",
    "math.f32Div": "fdiv",
    "math.f32Rem": "frem",
  } as const;
  if (Object.hasOwn(binary, expr.fn)) {
    const operation = binary[expr.fn as keyof typeof binary];
    B.line(`${value} = ${operation} float ${operands[0]}, ${operands[1]}`);
  } else if (expr.fn === "math.f32Neg") {
    B.line(`${value} = fneg float ${operands[0]}`);
  } else {
    const intrinsic =
      expr.fn === "math.f32Sqrt"
        ? "sqrt"
        : expr.fn === "math.f32Abs"
          ? "fabs"
          : expr.fn === "math.f32Min"
            ? "minimum"
            : expr.fn === "math.f32Max"
              ? "maximum"
              : null;
    if (intrinsic === null) throw new InternalCompilerError(`unknown f32 operation: ${expr.fn}`);
    const types = operands.map(() => "float").join(", ");
    host.declare(`declare float @llvm.${intrinsic}.f32(${types})`);
    B.line(
      `${value} = call float @llvm.${intrinsic}.f32(${operands.map((operand) => `float ${operand}`).join(", ")})`,
    );
  }
  const result = B.tmp();
  B.line(`${result} = fpext float ${value} to double`);
  return { name: result, type: expr.type };
}

/** The ordinary path reads whole vectors; exceptional element indices retain
 * JavaScript's per-element NaN/ignored-store semantics. Shared views use the
 * existing non-racy element accessors, never unguarded native vector memory. */
export function emitFloat32x4Math(host: LlvmEmitterContext, expr: LibCallExpr): LlValue {
  const B = host.B;
  const args = emitBorrowedInputs(host, expr.args);
  const done = B.newLabel("f32x4.done");
  const slow = B.newLabel("f32x4.elements");
  const vector = (a: string, b: string): string => {
    const result = B.tmp();
    const operation = expr.fn.slice("f32x4.".length);
    if (operation === "min" || operation === "max") {
      const name = operation === "min" ? "minimum" : "maximum";
      host.declare(`declare <4 x float> @llvm.${name}.v4f32(<4 x float>, <4 x float>)`);
      B.line(
        `${result} = call <4 x float> @llvm.${name}.v4f32(<4 x float> ${a}, <4 x float> ${b})`,
      );
    } else {
      const instruction =
        operation === "add"
          ? "fadd"
          : operation === "sub"
            ? "fsub"
            : operation === "mul"
              ? "fmul"
              : operation === "div"
                ? "fdiv"
                : null;
      if (instruction === null)
        throw new InternalCompilerError(`unknown vector operation ${expr.fn}`);
      B.line(`${result} = ${instruction} <4 x float> ${a}, ${b}`);
    }
    return result;
  };
  {
    const indices: string[] = [];
    for (let i = 0; i < 6; i += 2) {
      noteBytesReceiver(host, expr.args[i]!, args[i]!.name);
      if (host.mod.workers || host.mod.lib?.threadInstances) {
        const storage = emitBytesSharedStorage(host, args[i]!.name);
        const plain = B.tmp(),
          local = B.newLabel("f32x4.local");
        B.line(`${plain} = icmp eq ptr ${storage}, null`);
        let allowed = plain;
        if (i !== 0) {
          const readOnly = emitBytesReadOnlyShared(host, args[i]!.name);
          allowed = B.tmp();
          B.line(`${allowed} = or i1 ${plain}, ${readOnly}`);
        }
        B.condBr(allowed, local, slow);
        B.startBlock(local);
      }
      const length = emitBytesHeaderLength(host, args[i]!.name);
      const capacity = B.tmp(),
        room = B.tmp(),
        positive = B.tmp(),
        addressable = B.tmp();
      const allowed = B.tmp(),
        within = B.tmp(),
        capFloat = B.tmp(),
        candidate = B.tmp();
      B.line(`${room} = icmp uge ${host.sizeType} ${length}, 4`);
      B.line(`${capacity} = sub ${host.sizeType} ${length}, 4`);
      B.line(`${capFloat} = uitofp ${host.sizeType} ${capacity} to double`);
      B.line(`${positive} = fcmp oge double ${args[i + 1]!.name}, 0.0`);
      B.line(
        `${addressable} = fcmp olt double ${args[i + 1]!.name}, ${host.sizeType === "i32" ? "0x41F0000000000000" : "0x43F0000000000000"}`,
      );
      B.line(`${within} = fcmp ole double ${args[i + 1]!.name}, ${capFloat}`);
      B.line(`${allowed} = and i1 ${positive}, ${addressable}`);
      B.line(`${candidate} = and i1 ${allowed}, ${within}`);
      const safe = B.tmp(),
        convert = B.newLabel("f32x4.index");
      B.line(`${safe} = and i1 ${candidate}, ${room}`);
      B.condBr(safe, convert, slow);
      B.startBlock(convert);
      const index = B.tmp(),
        roundTrip = B.tmp(),
        integral = B.tmp(),
        bounded = B.tmp(),
        valid = B.tmp();
      B.line(`${index} = fptoui double ${args[i + 1]!.name} to ${host.sizeType}`);
      B.line(`${roundTrip} = uitofp ${host.sizeType} ${index} to double`);
      B.line(`${integral} = fcmp oeq double ${roundTrip}, ${args[i + 1]!.name}`);
      B.line(`${bounded} = icmp ule ${host.sizeType} ${index}, ${capacity}`);
      B.line(`${valid} = and i1 ${integral}, ${bounded}`);
      const next = B.newLabel("f32x4.valid");
      B.condBr(valid, next, slow);
      B.startBlock(next);
      indices.push(index);
    }
    const pointer = (argument: number, index: number): string => {
      const data = host.emitBytesData(args[argument]!.name),
        address = B.tmp();
      B.line(
        `${address} = getelementptr inbounds float, ptr ${data}, ${host.sizeType} ${indices[index]}`,
      );
      return address;
    };
    const out = pointer(0, 0),
      ap = pointer(2, 1),
      bp = pointer(4, 2);
    const a = B.tmp(),
      b = B.tmp();
    B.line(`${a} = load <4 x float>, ptr ${ap}, align 4`);
    B.line(`${b} = load <4 x float>, ptr ${bp}, align 4`);
    const result = vector(a, b);
    B.line(`store <4 x float> ${result}, ptr ${out}, align 4`);
    B.br(done);
  }
  B.startBlock(slow);
  const offset = (argument: number, lane: number): LlValue => {
    if (lane === 0) return args[argument]!;
    const index = B.tmp();
    B.line(`${index} = fadd double ${args[argument]!.name}, ${lane}.0`);
    return { name: index, type: args[argument]!.type };
  };
  const load = (argument: number): string => {
    let packed = "poison";
    for (let lane = 0; lane < 4; lane++) {
      const v = host.emitBytesGet(
        "f32",
        args[argument]!.name,
        offset(argument + 1, lane),
        undefined,
        false,
        true,
      );
      const narrowed = B.tmp(),
        next = B.tmp();
      B.line(`${narrowed} = fptrunc double ${v.name} to float`);
      B.line(`${next} = insertelement <4 x float> ${packed}, float ${narrowed}, i32 ${lane}`);
      packed = next;
    }
    return packed;
  };
  const result = vector(load(2), load(4));
  for (let lane = 0; lane < 4; lane++) {
    const value = B.tmp(),
      widened = B.tmp();
    B.line(`${value} = extractelement <4 x float> ${result}, i32 ${lane}`);
    B.line(`${widened} = fpext float ${value} to double`);
    host.emitBytesSet("f32", args[0]!.name, offset(1, lane), {
      name: widened,
      type: { kind: "f64" },
    });
  }
  B.br(done);
  B.startBlock(done);
  return { name: "", type: expr.type };
}
