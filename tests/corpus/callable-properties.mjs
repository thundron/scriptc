function render(value) { return value; }
render.options = render.setOptions = function(value) {
  this.defaults = value;
  return this;
};
render.defaults = { mode: "original" };
const alias = render;
console.log(alias.options === render.setOptions);
console.log(alias.options({ mode: "changed" }) === render, render.defaults.mode);
console.log(render("ok"));
let log = "";
Object.defineProperties(render, {
  setting: {
    configurable: true, enumerable: true,
    get: function() { log += "get;"; return this.defaults.mode; },
    set: function(value) { log += "set;"; this.defaults = { mode: value }; }
  },
  fixed: { value: 7 }
});
console.log(alias.setting = "updated", render.setting);
console.log(log);
console.log(Object.keys(alias).join(","));
const desc = Object.getOwnPropertyDescriptor(alias, "setting");
console.log(typeof desc.get, typeof desc.set, desc.enumerable, desc.configurable);
for (const key of ["fixed", "name", "length"]) {
  try { alias[key] = 5; } catch (error) { console.log(key, error.name); }
}
Object.defineProperty(render, "name", { writable: true });
function write(target, key, value) { target[key] = value; }
write(render, "name", "renamed");
console.log(alias.name, render.length);
function receiver() { log += "receiver;"; return alias; }
function key() { log += "key;"; return { toString() { log += "coerce;"; return "choice"; } }; }
function value() { log += "value;"; return 42; }
log = "";
console.log(receiver()[key()] = render.other = value());
console.log(log, alias.choice, alias.other);
function remove(target, key) { delete target[key]; }
remove(alias, "other");
console.log(Object.hasOwn(render, "other"), "choice" in render);
Object.defineProperty(alias, "method", {
  get: function() { log += "method;"; return function(arg) { return this === render ? arg : "wrong"; }; }, configurable: true
});
log = "";
console.log(render.method(value()), log);

Object.defineProperty(alias, "fails", {
  set: function(value) { log += String(value); throw new TypeError("setter failed"); }
});
log = "";
try { alias.fails = value(); } catch (error) { console.log(error.name, error.message, log); }
Object.defineProperty(alias, "throws", {
  get: function() { log += "getter;"; throw new TypeError("getter failed"); }
});
log = "";
try { render.throws(value()); } catch (error) { console.log(error.name, error.message, log); }
remove(alias, "name");
remove(alias, "length");
console.log(JSON.stringify(alias.name), alias.length, Object.hasOwn(alias, "name"), "name" in render);
const data = Object.getOwnPropertyDescriptor(alias, "choice");
console.log(data.value, data.writable, data.enumerable, data.configurable);
