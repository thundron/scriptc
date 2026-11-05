const object = Object.create(null);
object.value = 1;
object.nested = { value: 1 };
let calls = 0;
let setting = 0;
Object.defineProperty(object, "accessor", { get() { calls++; return setting; }, set(value) { setting = value; }, configurable: true });
console.log(Object.isFrozen(object), Object.freeze(object) === object, Object.isFrozen(object), calls);
object.accessor = 4;
console.log(object.accessor, calls);
object.nested.value = 2;
console.log(object.nested.value);
for (const field of ["value", "accessor"]) {
  const descriptor = Object.getOwnPropertyDescriptor(object, field);
  console.log(descriptor.configurable, descriptor.writable);
}
try { object.value = 2; } catch (error) { console.log("write", error.name); }
try { object.extra = 2; } catch (error) { console.log("add", error.name, error.message); }
try { delete object.value; } catch (error) { console.log("delete", error.name); }
try { Object.defineProperty(object, "value", { value: 2 }); } catch (error) { console.log("redefine", error.name); }
try { Object.defineProperty(object, "extra", { value: 2 }); } catch (error) { console.log("define", error.name, error.message); }
try { Object.assign(object, { extra: 2 }); } catch (error) { console.log("assign", error.name, error.message); }
console.log(object.value, Object.keys(object).join(","), Object.freeze(object) === object);
for (const value of [0n, 1, true, "hello", undefined, null]) console.log(Object.freeze(value) === value, Object.isFrozen(value));
const original = Object.create(null);
original.value = 1;
const clone = structuredClone(Object.freeze(original));
console.log(Object.isFrozen(clone));
clone.value = 2;
console.log(clone.value);
