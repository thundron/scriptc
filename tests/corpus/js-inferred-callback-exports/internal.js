export const toDate = value => new Date(value);
function annotatedFactory() {
  return Object.assign(function() { return "callable"; }, { read: () => "annotated" });
}
/** @type {Function} */
export const annotatedValue = annotatedFactory();
export function readAnnotatedValue() { return annotatedValue.read(); }
export function service() {
  function Key() {}
  Object.setPrototypeOf(Key, {
    pipe(callback) { return callback(this.key); },
    /** @returns {Generator<string, string, unknown>} */
    *[Symbol.iterator]() { return String(yield this.key); },
  });
  const init = key => { Key.key = key; return Key; };
  return arguments.length > 0 ? init(arguments[0]) : init;
}
export function makeObject(options) {
  const typeId = "commandType";
  return Object.assign(Object.create({ kind: "command" }), {
    [typeId]: typeId,
    name: options.name,
    handle: value => value,
    ...(options.description !== undefined ? { description: options.description } : {}),
  });
}
function invoke(options) { return options.commit(42) + "/" + options.commit(...[42]); }
export function makeOptions(options) {
  const commit = options.commit ?? "COMMIT";
  return invoke({
    begin: value => value,
    commit: typeof commit === "string" ? value => commit + ":" + value : commit,
  });
}
export default Object.assign(function(value) { return value + 1; }, {
  fromState(value) { return value - 1; },
});
