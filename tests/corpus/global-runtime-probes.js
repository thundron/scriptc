const bun = globalThis.Bun;
const width = bun?.stringWidth ?? ((text) => text.length);
const sleep = bun?.sleep ?? (() => "portable");
console.log(typeof bun, width("hello"), sleep());
console.log(globalThis?.Bun === undefined, globalThis.Deno === undefined);
const scope = globalThis;
console.log(scope.Bun === undefined, global.Bun === undefined);
function shadowed(globalThis) {
  return globalThis.Bun.stringWidth("abc");
}
console.log(shadowed({ Bun: { stringWidth: (text) => text.length + 4 } }));
