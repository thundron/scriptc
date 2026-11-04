function append(values) { values.push(3); return values; }
function pair(first, second) { console.log('same', first === second); first.push(4); }
function variadic(...values) { values[0].push(5); return values[0]; }
function fromArguments() { arguments[0].push(6); return arguments[0]; }
const values = [1, 2];
console.log('call', append(values) === values, values.join(','));
pair(values, values);
console.log('pair', values.join(','));
console.log('rest', variadic(values) === values, values.join(','));
console.log('arguments', fromArguments(values) === values, values.join(','));
function wrap() { return values; }
console.log('return', wrap() === values);
const object = { values };
object.values.push(7);
console.log('property', object.values === values, values.join(','));
class Empty { visit() {} }
class Collector extends Empty { visit(target) { target.push(8); } }
function dispatch(object, target) { return object.visit(target); }
const result = dispatch(new Collector(), values);
console.log('void', result === undefined, values.join(','));

/** @param {unknown} input */
function checked(input) { return input; }
const shared = checked(values);
console.log('concat', shared.concat(values).join(','));
function add(a, b) { return a + b; }
const argumentsList = [10, 20];
console.log('apply', checked(add).apply(null, argumentsList));
function names(input) {
  const result = [];
  for (const name in input) result.push(name);
  return result.join(',');
}
console.log('keys', names(shared));
const entries = [['first', 1], ['second', 2]];
const dictionary = Object.fromEntries(checked(entries));
console.log('entries', dictionary.first, dictionary.second);
const sparse = [1];
sparse.length = 3;
sparse[2] = 5;
console.log('sparse', checked(sparse).join(','));
/** @type {any} */
const flexible = [1, 2];
flexible[0] = 'changed';
console.log('fresh', flexible.join(','));
