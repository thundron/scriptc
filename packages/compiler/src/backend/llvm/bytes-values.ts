import { BYTES_ELEMENT_SIZE, type IrBytesElem, type IrExpr } from "../../ir/ir.js";
import type { LlValue, LlvmEmitterContext } from "./expr-context.js";

/** JS-exact numeric element coercion, independently of its destination.
 * Bulk operations coerce once; ordinary element stores use the same path. */
export function emitBytesStoreValue(
  host: LlvmEmitterContext,
  elem: IrBytesElem,
  value: LlValue,
  expr?: IrExpr,
): { type: string; name: string } {
  const B = host.B;
  let stored: string | null;
  if (elem === "u8c") {
    // ToUint8Clamp, as scr_bytes_to_u8_clamp computes it: NaN and values
    // at most 0 store 0, values at least 255 store 255, and values between
    // round to the nearest integer, ties to even. Adding and subtracting
    // 2^52 rounds a value in (0, 255) that way in the default rounding mode,
    // with no call or branch, so loops of clamped stores can vectorize.
    const positive = B.tmp(),
      high = B.tmp(),
      shifted = B.tmp(),
      rounded = B.tmp(),
      upper = B.tmp(),
      clamped = B.tmp();
    stored = B.tmp();
    B.line(`${positive} = fcmp ogt double ${value.name}, 0.0`);
    B.line(`${high} = fcmp oge double ${value.name}, 255.0`);
    B.line(`${shifted} = fadd double ${value.name}, 0x4330000000000000`);
    B.line(`${rounded} = fsub double ${shifted}, 0x4330000000000000`);
    B.line(`${upper} = select i1 ${high}, double 255.0, double ${rounded}`);
    B.line(`${clamped} = select i1 ${positive}, double ${upper}, double 0.0`);
    B.line(`${stored} = fptoui double ${clamped} to i32`);
  } else
    stored =
      elem === "f16" || elem === "f32" || elem === "f64"
        ? null
        : host.emitToUint32(value.name, expr, value.uint32);
  if (elem === "f16") {
    host.declare(`declare zeroext i16 @scr_f16_from_f64(double)`);
    const narrowed = B.tmp();
    B.line(`${narrowed} = call zeroext i16 @scr_f16_from_f64(double ${value.name})`);
    return { type: "i16", name: narrowed };
  }
  // The element's bits as an LLVM value of the element's width.
  let ty: string;
  let operand: string;
  if (BYTES_ELEMENT_SIZE[elem] < 4) {
    ty = `i${BYTES_ELEMENT_SIZE[elem] * 8}`;
    operand = B.tmp();
    B.line(`${operand} = trunc i32 ${stored!} to ${ty}`);
  } else if (elem === "f32") {
    ty = "float";
    operand = B.tmp();
    B.line(`${operand} = fptrunc double ${value.name} to float`);
  } else if (elem === "f64") {
    ty = "double";
    operand = value.name;
  } else {
    ty = "i32";
    operand = stored!;
  }
  return { type: ty, name: operand };
}
