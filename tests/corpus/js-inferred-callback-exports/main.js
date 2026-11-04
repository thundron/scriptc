import * as Facade from "./facade.js";
import decorated, { annotatedValue, readAnnotatedValue, service, makeObject, makeOptions } from "./internal.js";
console.log(decorated(4), decorated.fromState(4));
console.log(annotatedValue(), readAnnotatedValue());
const key = service("key");
console.log(key.pipe(value => value + "!"));
const initialized = service()("other");
console.log(initialized.pipe(value => value + "!"));
/** @returns {Generator<string, string, unknown>} */
function* delegate() { return yield* key; }
const iterator = delegate();
console.log(iterator.next().value, iterator.next("done").value);
const object = makeObject({ name: "test", description: "example" });
console.log(object.kind, object.name, object.description);
console.log(object.commandType, object.handle("handled"));
console.log(Object.hasOwn(makeObject({ name: "bare" }), "description"));
function collect(options) { return { values: new Set(options.values) }; }
console.log(collect({ values: ["one", "two", "two"] }).values.size);
console.log(makeOptions({}), makeOptions({ commit: value => value + 1 }));
function transform(callback) { return { callback }; }
const getter = transform(Facade.toDate);
const date = getter.callback(0);
console.log(date instanceof Date, date.toISOString());

/** @param {string} value @return {number} */
function parse(value) {
  if (value === "invalid") return;
  switch (value) {
    case "two": return 2;
    default: return undefined;
  }
}
/** @param {string} value @return {number|string} */
const format = function(value) { return value === "text" ? "value" : parse(value); };
console.log(format("invalid"), format("unknown"), format("two"), format("text"));
function fallback(value) { return parse(value) ?? 8; }
function falsyFallback(value) { return parse(value) || 9; }
let total = fallback("invalid");
total += falsyFallback("invalid");
console.log(total, fallback("two"), falsyFallback("two"));

/** @param {boolean} present @return {string | undefined} */
function maybeText(present) { return present ? "value" : undefined; }
function definiteText(present) {
  const text = maybeText(present);
  if (text !== undefined) return text;
  return "fallback";
}
function path(present) {
  let result = maybeText(present) ?? definiteText(present);
  if (result !== "") result += "/";
  return result;
}
console.log(path(true), path(false));
const asyncFormat = async value => parse(value);
async function main() {
  console.log(await asyncFormat("invalid"), await asyncFormat("two"));
}
main();
