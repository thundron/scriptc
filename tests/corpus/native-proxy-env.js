const values = { one: 1, two: 2 };
function erase(object, key) { delete object[key]; }
let trace = "";
const proxy = new Proxy({}, {
  get(target, key, receiver) {
    trace += `get:${key};`;
    if (key === "identity") return receiver;
    if (key === "method") return function(value) { return this.one + value; };
    return values[key];
  },
  has(target, key) { trace += `has:${key};`; return key in values; },
  ownKeys() { trace += "keys;"; return ["two", "hidden", "one", "absent"]; },
  getOwnPropertyDescriptor(target, key) {
    trace += `desc:${key};`;
    if (key === "absent") return;
    return { configurable: true, enumerable: key !== "hidden", get: () => values[key] };
  }
});
console.log(proxy.one, proxy.identity === proxy, proxy.method(4));
console.log(typeof proxy, !!proxy, Array.isArray(proxy), proxy !== new Proxy({}, {}));
console.log("one" in proxy, "no" in proxy, trace);
trace = "";
console.log(Object.keys(proxy).join(","), trace);
trace = "";
console.log(Object.values(proxy).join(","), trace);
trace = "";
console.log(Object.entries(proxy).join("|"), trace);
trace = "";
console.log(Object.hasOwn(proxy, "one"), Object.hasOwn(proxy, "absent"), trace);
const descriptor = Object.getOwnPropertyDescriptor(proxy, "one");
console.log(descriptor.enumerable, descriptor.configurable, descriptor.set === undefined, descriptor.get());
values.one = 8;
console.log(proxy.one, descriptor.get());
function readGlobalProxy() { return proxy.one; }
console.log(readGlobalProxy());
const target = { count: 1 };
const handler = { get: function(obj, key, receiver) { return obj[key] + (this === handler ? 10 : 0); } };
const live = new Proxy(target, handler);
console.log(live.count);
target.count = 3;
handler.get = function(obj, key) { return obj[key] + 20; };
console.log(live.count);
erase(handler, "get");
console.log(live.count, Object.keys(live).join(","));
const mutator = new Proxy(target, {
  set(obj, key, value, receiver) { obj[key] = value; return true; },
  deleteProperty(obj, key) { delete obj[key]; return true; }
});
mutator.count = 7;
console.log(target.count);
erase(mutator, "count");
console.log(Object.keys(target).length);
function membership(value, key) { return key in value; }
const throws = new Proxy({}, {
  get() { throw new Error("get failed"); },
  has() { throw new Error("has failed"); },
  ownKeys() { throw new Error("keys failed"); },
  getOwnPropertyDescriptor() { throw new Error("descriptor failed"); }
});
try { console.log(throws.x); } catch (error) { console.log(error.message); }
try { console.log("x" in throws); } catch (error) { console.log(error.message); }
try { console.log(membership(throws, "x")); } catch (error) { console.log(error.message); }
try { console.log(Object.keys(throws)); } catch (error) { console.log(error.message); }
try { console.log(Object.hasOwn(throws, "x")); } catch (error) { console.log(error.message); }
const duplicates = new Proxy({}, { ownKeys() { return ["x", "x"]; } });
try { Object.keys(duplicates); } catch (error) { console.log(error.name); }
const badKey = new Proxy({}, { ownKeys() { return [3]; } });
try { Object.keys(badKey); } catch (error) { console.log(error.name); }
const fixed = new Proxy({}, { getOwnPropertyDescriptor() { return { value: 1 }; } });
try { Object.hasOwn(fixed, "x"); } catch (error) { console.log(error.name); }
const plain = new Proxy({}, {});
console.log("toString" in plain, "absent" in plain, plain.absent === undefined);
const bare = new Proxy(Object.create(null), {});
console.log("toString" in bare, bare.toString === undefined);
const keys = ["first", "second"];
const snapshot = new Proxy({}, {
  ownKeys() { return keys; },
  getOwnPropertyDescriptor(target, key) {
    keys[1] = "changed";
    return { enumerable: true, configurable: true, value: key };
  }
});
console.log(Object.keys(snapshot).join(","));
const protectedTarget = { visible: 2 };
Object.defineProperty(protectedTarget, "fixed", { value: -0 });
const protectedProxy = new Proxy(protectedTarget, {});
const protectedDescriptor = Object.getOwnPropertyDescriptor(protectedProxy, "fixed");
console.log(Object.keys(protectedProxy).join(","), protectedDescriptor.enumerable, protectedDescriptor.writable, protectedDescriptor.configurable, 1 / protectedDescriptor.value);
const readonlyGet = new Proxy(protectedTarget, { get() { return 0; } });
try { console.log(readonlyGet.fixed); } catch (error) { console.log(error.name); }
const readonlyHas = new Proxy(protectedTarget, { has() { return false; } });
try { console.log("fixed" in readonlyHas); } catch (error) { console.log(error.name); }
const readonlyKeys = new Proxy(protectedTarget, { ownKeys() { return ["visible"]; } });
try { Object.keys(readonlyKeys); } catch (error) { console.log(error.name); }
const readonlyDescriptor = new Proxy(protectedTarget, { getOwnPropertyDescriptor() { return; } });
try { Object.hasOwn(readonlyDescriptor, "fixed"); } catch (error) { console.log(error.name); }
const readonlySet = new Proxy(protectedTarget, { set() { return true; } });
try { readonlySet.fixed = 1; } catch (error) { console.log(error.name); }
const readonlyDelete = new Proxy(protectedTarget, { deleteProperty() { return true; } });
try { erase(readonlyDelete, "fixed"); } catch (error) { console.log(error.name); }
const exactDescriptor = new Proxy(protectedTarget, { getOwnPropertyDescriptor() { return { value: -0 }; } });
console.log(Object.hasOwn(exactDescriptor, "fixed"), 1 / Object.getOwnPropertyDescriptor(exactDescriptor, "fixed").value);
const showHidden = new Proxy(protectedTarget, {
  getOwnPropertyDescriptor(target, key) {
    if (key === "fixed") return { value: -0 };
    return { value: 2, enumerable: true, configurable: true };
  }
});
console.log(Object.keys(showHidden).join(","));
