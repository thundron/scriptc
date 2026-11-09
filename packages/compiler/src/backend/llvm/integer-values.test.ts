import { expect, test } from "vitest";
import { F64, VOID, type IrModule } from "../../ir/ir.js";
import { LlEmitter } from "./emitter.js";
import { indexInteger } from "./integer-values.js";
import type { LlValue } from "./expr-context.js";
const loc = { file: "index-span.ts", start: 0, end: 0 };
function host(): LlEmitter {
  const mod: IrModule = {
    irVersion: 17,
    sourceFile: loc.file,
    entry: "%main",
    functions: [{ name: "%main", params: [], locals: [], returnType: VOID, body: [], loc }],
  };
  return new LlEmitter(mod, { pointerBits: 64 }, null, null);
}
test("a bounded wide view cannot index an unbounded native64 typed-array span", () => {
  const value: LlValue = {
    name: "%double",
    type: F64,
    wideInteger: { name: "%ideal", bound: 2 ** 54, below: 2 ** 32 },
  };
  expect(indexInteger(host(), value, undefined, Infinity)).toBeNull();
  expect(indexInteger(host(), value, undefined, 2 ** 32)).toBe("%ideal");
});
test("globally exact wide views still index native64 spans without a round trip", () => {
  const value: LlValue = {
    name: "%double",
    type: F64,
    wideInteger: { name: "%ideal", bound: 2 ** 34, below: 2 ** 53 },
  };
  expect(indexInteger(host(), value, undefined, Infinity)).toBe("%ideal");
});
test("the consumer length bound must fit the view exactness interval", () => {
  const value: LlValue = {
    name: "%double",
    type: F64,
    wideInteger: { name: "%ideal", bound: 2 ** 54, below: 2 ** 32 },
  };
  expect(indexInteger(host(), value, undefined, 2 ** 32 + 1)).toBeNull();
});
