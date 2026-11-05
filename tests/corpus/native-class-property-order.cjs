class State {
  width = 1;
  get size() { console.log("get"); return this.width; }
  set size(value) { console.log("set", value); this.width = value; }
  get failed() { if (this.width > 0) throw new Error("getter"); return 0; }
}
const state = new State();
const view = /** @type {unknown} */ (state);
const key = { toString() { console.log("key"); return "size"; } };
function value() { console.log("value"); return 2; }
view[key] = value();
console.log("read", view[String("size")], state.width);
const throwingKey = { toString() { throw new Error("key conversion"); } };
try { view[throwingKey] = value(); } catch (error) { console.log(error.message); }
try { console.log(view.failed); } catch (error) { console.log(error.message); }
const absent = /** @type {unknown} */ (null);
try { absent[key] = value(); } catch (error) { console.log("absent", error.name); }
