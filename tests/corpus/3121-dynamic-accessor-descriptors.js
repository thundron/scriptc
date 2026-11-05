const object = JSON.parse('{"data":1}');
let stored = 2;
let reads = 0;
let writes = 0;
function getStored() { reads++; return stored; }
function setStored(value) { writes++; stored = value; }
Object.defineProperty(object, 'watched', { get: getStored, set: setStored, enumerable: true, configurable: true });
const descriptor = Object.getOwnPropertyDescriptor(object, 'watched');
console.log(descriptor.get === getStored, descriptor.set === setStored, descriptor.enumerable, descriptor.configurable);
console.log(object.watched, reads);
object.watched = 7;
console.log(stored, writes, object.watched);
console.log(Object.keys(object), Object.values(object), Object.entries(object), JSON.stringify(object));
Object.defineProperty(object, 'watched', { get: getStored });
console.log(Object.getOwnPropertyDescriptor(object, 'watched').set === setStored);
Object.defineProperty(object, 'watched', { value: 9, writable: true });
console.log(object.watched, Object.getOwnPropertyDescriptor(object, 'watched').get);
object.watched = 10;
console.log(object.watched, stored);
const sealed = JSON.parse('{}');
Object.defineProperty(sealed, 'read', { get: getStored });
try { Object.defineProperty(sealed, 'read', { get: function() { return 1; } }); } catch (error) { console.log(error.name); }
console.log(Object.getOwnPropertyDescriptor(sealed, 'read').get === getStored);
const other = JSON.parse('{}');
Object.defineProperties(other, { watched: { get: getStored, set: setStored, enumerable: true } });
console.log(other.watched, Object.keys(other));
other.watched = 12;
console.log(stored, writes);
const writeOnly = JSON.parse('{}');
Object.defineProperty(writeOnly, 'only', { set: setStored, enumerable: true });
console.log(writeOnly.only);
writeOnly.only = 15;
console.log(stored, writes);
const throwing = JSON.parse('{}');
function explode() { throw new TypeError('getter failed'); }
Object.defineProperty(throwing, 'x', { get: explode, enumerable: true });
try { console.log(throwing.x); } catch (error) { console.log(error.name, error.message); }
try { Object.values(throwing); } catch (error) { console.log(error.name, error.message); }
try { JSON.stringify(throwing); } catch (error) { console.log(error.name, error.message); }
function identityReplacer(key, value) { return value; }
try { JSON.stringify(throwing, identityReplacer); } catch (error) { console.log(error.name, error.message); }
const customJSON = JSON.parse('{"raw":1}');
let toJSONReads = 0;
function customToJSON() { return { ready: 5 }; }
function getToJSON() { toJSONReads++; return customToJSON; }
Object.defineProperty(customJSON, 'toJSON', { get: getToJSON });
console.log(JSON.stringify(customJSON, identityReplacer), toJSONReads);
const badLength = JSON.parse('{}');
Object.defineProperty(badLength, 'length', { get: explode });
try { new Uint8Array(badLength); } catch (error) { console.log(error.name, error.message); }
const badIndex = JSON.parse('{"length":1}');
Object.defineProperty(badIndex, '0', { get: explode });
try { Uint8Array.from(badIndex); } catch (error) { console.log(error.name, error.message); }
const source = JSON.parse('{}');
Object.defineProperty(source, 'shared', { get: getStored, enumerable: true });
const destination = JSON.parse('{}');
Object.defineProperty(destination, 'shared', { set: setStored, enumerable: true });
Object.assign(destination, source);
console.log(stored, writes, destination.shared);
const changing = JSON.parse('{}');
function readFirst() { changing.second = 9; return 1; }
Object.defineProperty(changing, 'first', { get: readFirst, enumerable: true });
Object.defineProperty(changing, 'second', { value: 2, writable: true, enumerable: true });
console.log(Object.values(changing), JSON.stringify(changing));
var inferred = {};
console.log(Object.keys(inferred));
inferred.later = 4;
Object.defineProperty(inferred, 'computed', { get: getStored, enumerable: true });
console.log(Object.keys(inferred), inferred.computed, JSON.stringify(inferred));
const accessorDescriptor = JSON.parse('{}');
let descriptorReads = 0;
function descriptorGetter() { descriptorReads++; return getStored; }
function descriptorEnumerable() { descriptorReads++; return true; }
Object.defineProperty(accessorDescriptor, 'get', { get: descriptorGetter, enumerable: true });
Object.defineProperty(accessorDescriptor, 'enumerable', { get: descriptorEnumerable, enumerable: true });
const described = JSON.parse('{}');
Object.defineProperty(described, 'computed', accessorDescriptor);
console.log(described.computed, descriptorReads, Object.keys(described));
const staged = JSON.parse('{}');
const definitions = JSON.parse('{}');
function firstDefinition() { return { value: 1, enumerable: true }; }
function failedDefinition() { throw new TypeError('descriptor failed'); }
Object.defineProperty(definitions, 'first', { get: firstDefinition, enumerable: true });
Object.defineProperty(definitions, 'hidden', { value: { value: 99 }, enumerable: false });
Object.defineProperty(definitions, 'bad', { get: failedDefinition, enumerable: true });
try { Object.defineProperties(staged, definitions); } catch (error) { console.log(error.name, error.message); }
console.log(Object.keys(staged));
const prepared = JSON.parse('{}');
const converted = JSON.parse('{}');
function prepareDescriptor() { return accessorDescriptor; }
Object.defineProperty(prepared, 'converted', { get: prepareDescriptor, enumerable: true });
Object.defineProperties(converted, prepared);
console.log(converted.converted, descriptorReads, Object.keys(converted));
const shifted = JSON.parse('{}');
function showHidden() { Object.defineProperty(shifted, 'hidden', { enumerable: true }); return 1; }
Object.defineProperty(shifted, 'first', { get: showHidden, enumerable: true });
Object.defineProperty(shifted, 'hidden', { value: 2, enumerable: false, configurable: true });
console.log(Object.values(shifted));
Object.defineProperty(shifted, 'hidden', { enumerable: false });
console.log(JSON.stringify(shifted));
Object.defineProperty(shifted, 'hidden', { enumerable: false });
const assigned = JSON.parse('{}');
Object.assign(assigned, shifted);
console.log(Object.keys(assigned), JSON.stringify(assigned));
const proxyTarget = JSON.parse('{}');
Object.defineProperty(proxyTarget, 'fixed', { get: getStored, enumerable: true });
const proxy = new Proxy(proxyTarget, {});
console.log(proxy.fixed, Object.getOwnPropertyDescriptor(proxy, 'fixed').get === getStored);
const trappedProxy = new Proxy(proxyTarget, {
  get() { return 91; },
  getOwnPropertyDescriptor(target, key) { return Object.getOwnPropertyDescriptor(target, key); }
});
console.log(trappedProxy.fixed, Object.getOwnPropertyDescriptor(trappedProxy, 'fixed').get === getStored);
const noGetter = JSON.parse('{}');
Object.defineProperty(noGetter, 'fixed', { set: setStored });
const invalidGet = new Proxy(noGetter, { get() { return 91; } });
try { console.log(invalidGet.fixed); } catch (error) { console.log(error.name); }
const invalidSet = new Proxy(proxyTarget, { set() { return true; } });
try { invalidSet.fixed = 91; } catch (error) { console.log(error.name); }
const accessorHandler = JSON.parse('{}');
let trapReads = 0;
function proxyGetTrap() { return 23; }
function readProxyGetTrap() { trapReads++; return proxyGetTrap; }
Object.defineProperty(accessorHandler, 'get', { get: readProxyGetTrap });
const handlerProxy = new Proxy(proxyTarget, accessorHandler);
console.log(handlerProxy.fixed, trapReads);
const throwingHandler = JSON.parse('{}');
Object.defineProperty(throwingHandler, 'get', { get: explode });
try { console.log(new Proxy(proxyTarget, throwingHandler).fixed); } catch (error) { console.log(error.name); }
