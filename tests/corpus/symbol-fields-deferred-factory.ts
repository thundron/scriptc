export const create = () => new Tagged();
export const read = () => create().value();
const description = "scriptc.deferred.factory";
const tag = Symbol.for(description);

class Tagged {
  [tag] = "ready";
  value() { return this[tag]; }
}

console.log(read());
console.log(create()[tag]);
