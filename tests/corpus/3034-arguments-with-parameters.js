// A parameterized JavaScript function sees every supplied argument, even
// when called through a value and when optional positions are omitted.
export {};

let evaluations = 0;
function next(value) {
  evaluations++;
  return value;
}

function inspect(first, second) {
  console.log(arguments.length, arguments[0], arguments[1], arguments[2], first, second);
}

inspect(next(10), next(20));
const indirect = inspect;
indirect(next(30));
inspect();
inspect(next(40), next(50), next(60));

const choose = function (first, second) {
  return arguments.length === 1 ? first : second;
};
console.log(choose(7), choose(8, 9), evaluations);

function withDefault(value = 41) {
  console.log(arguments.length, arguments[0], value);
}
withDefault();
withDefault(undefined);
withDefault(5);

function readMutableUnit(first) {
  return arguments.length === 1 ? first.value : undefined;
}
const readThroughValue = readMutableUnit;
const mutableUnit = { value: null };
console.log('unit through value', readThroughValue(mutableUnit));
mutableUnit.value = 'changed';
console.log('updated through value', readThroughValue(mutableUnit));

// Saved arguments readers keep the implementation's return ABI even when
// JavaScript inference sees only a null/undefined field initializer.
class ArgumentState {
  nullable = null;
  missing = undefined;
  set(value) { this.nullable = value; this.missing = value; }
}
const argumentState = new ArgumentState();
function readNullable(first) {
  console.log('null args', arguments.length, first);
  return argumentState.nullable;
}
function readMissing(first) {
  console.log('undefined args', arguments.length, first);
  return argumentState.missing;
}
const savedNullable = readNullable;
const savedMissing = readMissing;
console.log('initial returns', savedNullable('a', 'b'), savedMissing());
argumentState.set('updated');
console.log('updated returns', savedNullable(), savedMissing('c', 'd'));
/** @returns {null} */
function literalNull(first) {
  console.log('literal args', arguments.length, first);
  return null;
}
class ArgumentReaders {
  nullReader = literalNull;
  undefinedReader = function (first) {
    console.log('literal undefined args', arguments.length, first);
    return undefined;
  };
  mutableReader = readNullable;
}
const argumentReaders = new ArgumentReaders();
const fieldNull = argumentReaders.nullReader;
const fieldUndefined = argumentReaders.undefinedReader;
const fieldMutable = argumentReaders.mutableReader;
console.log('field returns', fieldNull(4, 5), fieldUndefined(6), fieldMutable());
