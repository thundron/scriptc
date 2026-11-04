const object = JSON.parse('{"plain":1}');
Object.defineProperty(object, 'hidden', { value: 7 });
const hidden = Object.getOwnPropertyDescriptor(object, 'hidden');
console.log(hidden.value, hidden.writable, hidden.enumerable, hidden.configurable);
console.log(object.hidden, Object.keys(object), JSON.stringify(object));
Object.defineProperty(object, 'hidden', { value: 7 });
console.log(Object.getOwnPropertyDescriptor(object, 'hidden').value);
try { Object.defineProperty(object, 'hidden', { value: 9 }); } catch (error) { console.log(error.name); }
try { object.hidden = 10; } catch (error) { console.log(error.name); }
console.log(object.hidden);
Object.defineProperty(object, 'visible', { value: 2, writable: true, enumerable: true, configurable: true });
console.log(Object.keys(object), JSON.stringify(object));
object.visible = 3;
console.log(object.visible, Object.getOwnPropertyDescriptor(object, 'visible').writable);
console.log(Object.getOwnPropertyDescriptor(object, 'missing'));
const other = JSON.parse('{}');
Object.defineProperties(other, { hidden: { value: 4 }, shown: { value: 5, enumerable: true, writable: true } });
console.log(other.hidden, Object.keys(other), JSON.stringify(other));
console.log(Object.getOwnPropertyDescriptor(other, 'hidden').enumerable);
