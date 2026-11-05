class RenderError extends Error {
  constructor(message, cause) {
    super(message);
    if (cause !== undefined) this.cause = cause;
  }
  update(cause) { this.cause = cause; }
}
const absent = new RenderError("a");
const caused = new RenderError("b", 4);
console.log(absent.cause, "cause" in absent, caused.cause, "cause" in caused);
caused.update(undefined);
console.log(caused.cause, "cause" in caused);
delete caused.cause;
console.log(caused.cause, "cause" in caused);
caused.update("again");
console.log(caused.cause, "cause" in caused);
const error = new Error("options", { cause: "first" });
function descriptor(value) {
  const d = Object.getOwnPropertyDescriptor(value, "cause");
  console.log(d.value, d.enumerable, d.writable, d.configurable);
}
descriptor(error);
error.cause = "second";
descriptor(error);
delete error.cause;
console.log("cause" in error);
error.cause = undefined;
descriptor(error);
function overwrite(value) { value.cause = "through alias"; }
overwrite(error);
console.log(error.cause);
function remove(value) { delete value.cause; }
remove(error);
console.log(error.cause, "cause" in error);
function freeze(value) { Object.defineProperty(value, "cause", { value: "fixed", writable: false, configurable: false }); }
freeze(error);
try { error.cause = 7; } catch (error) { console.log(error.name); }
try { delete error.cause; } catch (error) { console.log(error.name); }
console.log(error.cause, "cause" in error);
const original = new Error("original");
const retained = new RenderError("retained", original);
retained.update(retained.cause);
const retainedCause = retained.cause;
if (retainedCause instanceof Error) console.log(retainedCause === original);
for (let i = 0; i < 40; i++) {
  const item = new RenderError("item", { number: i });
  item.update(new Error("replacement"));
  delete item.cause;
}
console.log("released");

const accessor = new Error("accessor", { cause: 1 });
let getterCalls = 0;
let storedCause = 3;
function installAccessor(value) {
  Object.defineProperty(value, "cause", {
    configurable: true,
    get() { getterCalls++; return storedCause; },
    set(next) { storedCause = next; }
  });
}
installAccessor(accessor);
console.log("cause" in accessor, getterCalls);
console.log(accessor.cause, getterCalls);
accessor.cause = 9;
console.log(accessor.cause, storedCause, getterCalls);
delete accessor.cause;
console.log("cause" in accessor, accessor.cause, getterCalls);
Object.defineProperty(accessor, "cause", { configurable: true, get() { throw new Error("cause getter"); } });
try { console.log(accessor.cause); } catch (error) { console.log(error.message); }
Object.defineProperty(accessor, "cause", { value: "restored", writable: true });
console.log(accessor.cause, "cause" in accessor);
