import { HANDLE_KINDS, POINTER_KINDS, RUNTIME_ERROR_CLASSES } from "../../../packages/compiler/src/ir/ir.js";
import type { IrType } from "../../../packages/compiler/src/ir/ir.js";

const kinds: readonly IrType["kind"][] = ["f64", "string", "netSocket", "procStream", "void"];
for (const kind of kinds) {
  console.log(kind, HANDLE_KINDS.has(kind), POINTER_KINDS.has(kind));
}
console.log(HANDLE_KINDS.size, POINTER_KINDS.size);
for (const [name, info] of RUNTIME_ERROR_CLASSES) {
  console.log(name, info.lib, info.kind, info.base);
}
