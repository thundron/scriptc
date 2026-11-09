import type { IrExpr } from "../../ir/ir.js";
import type { LlValue, LlvmEmitterContext } from "./expr-context.js";
import { emitBytesData, emitBytesHeaderLength, emitBytesSharedStorage } from "./expr-bytes.js";
import { emitBytesStoreValue } from "./bytes-values.js";
import { bytesElementAlias } from "./bytes-alias.js";
import { f64Lit, sizeToDouble } from "./common.js";

/** Fill fixed private views with one conversion and a typed store loop.
 * Shared storage keeps the runtime's atomic write path; mutable buffers
 * keep its detached/out-of-bounds validation. The result owns one reference. */
export function emitBytesFill(
  host: LlvmEmitterContext,
  expr: IrExpr & { kind: "bytesIntrinsic" },
  receiver: LlValue,
  args: LlValue[],
  discarded = false,
): LlValue | null {
  if (host.mod.bytesHeadersMutable || expr.receiver.type.kind !== "bytes") return null;
  const B = host.B,
    size = host.sizeType;
  const slow = B.newLabel("bytes.fill.slow"),
    local = B.newLabel("bytes.fill.local");
  const done = B.newLabel("bytes.fill.done");
  const storage = emitBytesSharedStorage(host, receiver.name),
    privateView = B.tmp();
  B.line(`${privateView} = icmp eq ptr ${storage}, null`);
  B.condBr(privateView, local, slow);
  B.startBlock(local);
  const length = emitBytesHeaderLength(host, receiver.name);
  const lengthDouble = B.tmp();
  B.line(`${lengthDouble} = ${sizeToDouble(size)} ${size} ${length} to double`);
  const relative = (index: number, fallback: string): string => {
    const value = args[index];
    if (!value) return fallback;
    const literal = expr.args[index];
    if (literal?.kind === "numLit") {
      if (Number.isNaN(literal.value) || literal.value === -Infinity || literal.value === 0)
        return "0";
      if (literal.value === Infinity) return length;
    }
    host.declare("declare double @llvm.trunc.f64(double)");
    const integer = B.tmp(),
      negative = B.tmp(),
      fromEnd = B.tmp(),
      relative = B.tmp();
    const positive = B.tmp(),
      below = B.tmp(),
      upper = B.tmp(),
      clamped = B.tmp(),
      out = B.tmp();
    B.line(`${integer} = call double @llvm.trunc.f64(double ${value.name})`);
    B.line(`${negative} = fcmp olt double ${integer}, 0.0`);
    B.line(`${fromEnd} = fadd double ${integer}, ${lengthDouble}`);
    B.line(`${relative} = select i1 ${negative}, double ${fromEnd}, double ${integer}`);
    B.line(`${positive} = fcmp ogt double ${relative}, 0.0`);
    B.line(`${below} = fcmp olt double ${relative}, ${lengthDouble}`);
    B.line(`${upper} = select i1 ${below}, double ${relative}, double ${lengthDouble}`);
    B.line(`${clamped} = select i1 ${positive}, double ${upper}, double 0.0`);
    B.line(`${out} = fptoui double ${clamped} to ${size}`);
    return out;
  };
  const start = relative(1, "0"),
    end = relative(2, length);
  const value = args[0] ?? { name: f64Lit(NaN), type: { kind: "f64" } as const };
  const stored = emitBytesStoreValue(host, expr.receiver.type.elem, value, expr.args[0]);
  const data = emitBytesData(host, receiver.name);
  const empty = B.tmp(),
    index = B.tmp(),
    next = B.tmp(),
    pointer = B.tmp(),
    more = B.tmp();
  const body = B.newLabel("bytes.fill.body"),
    filled = B.newLabel("bytes.fill.filled");
  const entry = B.currentLabel();
  B.line(`${empty} = icmp uge ${size} ${start}, ${end}`);
  B.condBr(empty, filled, body);
  B.startBlock(body);
  B.line(`${index} = phi ${size} [ ${start}, %${entry} ], [ ${next}, %${body} ]`);
  B.line(`${pointer} = getelementptr inbounds ${stored.type}, ptr ${data}, ${size} ${index}`);
  B.line(`store ${stored.type} ${stored.name}, ptr ${pointer}, align 1${bytesElementAlias(host)}`);
  B.line(`${next} = add nuw ${size} ${index}, 1`);
  B.line(`${more} = icmp ult ${size} ${next}, ${end}`);
  B.condBr(more, body, filled);
  B.startBlock(filled);
  const fastResult = discarded ? receiver.name : host.retainHeap(receiver.name, expr.type),
    fastEnd = B.currentLabel();
  B.br(done);
  B.startBlock(slow);
  host.declare("declare ptr @scr_bytes_fill_elem(ptr, double, double, double)");
  const slowResult = B.tmp();
  B.line(
    `${slowResult} = call ptr @scr_bytes_fill_elem(ptr ${receiver.name}, double ${value.name}, double ${args[1]?.name ?? f64Lit(0)}, double ${args[2]?.name ?? f64Lit(Infinity)})`,
  );
  if (discarded) host.releaseFrame(slowResult, expr.type);
  B.br(done);
  B.startBlock(done);
  if (discarded) return receiver;
  const result = B.tmp();
  B.line(`${result} = phi ptr [ ${fastResult}, %${fastEnd} ], [ ${slowResult}, %${slow} ]`);
  return host.own({ name: result, type: expr.type });
}
