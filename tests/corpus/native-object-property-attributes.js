const target = JSON.parse('{"visible":1}');
Object.defineProperty(target, 'hidden', { value: 2, writable: true, configurable: true });
console.log(Object.keys(target).join(','));
const absent = JSON.parse('null');
try { Object.prototype.propertyIsEnumerable.call(absent, 'x'); }
catch (error) { console.log(error.name); }
console.log(Object.getOwnPropertyNames(target).join(','));
console.log(target.hidden, Object.hasOwn(target, 'hidden'), target.propertyIsEnumerable('hidden'));
const first = Object.getOwnPropertyDescriptor(target, 'hidden');
console.log(first.value, first.writable, first.enumerable, first.configurable);
Object.defineProperty(target, 'hidden', { value: 3, enumerable: true });
const second = Object.getOwnPropertyDescriptor(target, 'hidden');
console.log(second.value, second.writable, second.enumerable, second.configurable);
console.log(Object.keys(target).join(','), Object.values(target).join(','));

const parent = JSON.parse('{"inherited":4}');
const child = Object.create(parent);
const omittedDescriptors = Object.create(parent, undefined);
console.log(omittedDescriptors.inherited, Object.getOwnPropertyNames(omittedDescriptors).length);
Object.defineProperty(child, 'own', { value: 5, enumerable: true, writable: true, configurable: true });
console.log(Object.keys(child).join(','), Object.getOwnPropertyNames(child).join(','));
console.log(Object.hasOwn(child, 'inherited'), 'inherited' in child);
const inherited = Object.getOwnPropertyDescriptor(child, 'inherited');
console.log(inherited === undefined, child.inherited, Object.getPrototypeOf(child) === parent);
const visited = [];
for (const key in child) visited.push(key);
console.log(visited.join(','));
Object.defineProperty(child, 'inherited', { value: 6, enumerable: false, writable: true });
const shadowed = [];
for (const key in child) shadowed.push(key);
console.log(child.inherited, parent.inherited, shadowed.join(','));

const fixed = JSON.parse('{"item":7}');
Object.freeze(fixed);
const frozen = Object.getOwnPropertyDescriptors(fixed);
console.log(frozen.item.value, frozen.item.writable, frozen.item.configurable);
console.log(Object.isExtensible(fixed), Object.isSealed(fixed), Object.isFrozen(fixed));
try { Object.defineProperty(fixed, 'item', { value: 8 }); }
catch (error) { console.log(error.name); }
try { Object.defineProperty(fixed, 'new', { value: 9 }); }
catch (error) { console.log(error.name); }
console.log(fixed.item, Object.hasOwn(fixed, 'new'));

const nullProto = Object.create(null);
nullProto.key = 10;
console.log(Object.getPrototypeOf(nullProto) === null, Object.keys(nullProto).join(','));
Object.preventExtensions(nullProto);
console.log(Object.isExtensible(nullProto), Object.isSealed(nullProto), Object.isFrozen(nullProto));
Object.seal(nullProto);
console.log(Object.isSealed(nullProto), Object.isFrozen(nullProto));
