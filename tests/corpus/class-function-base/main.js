import * as core from "./base.js";
const Base = core.Base;
function initialize() { console.log("field"); return 1; }
// @ts-expect-error JavaScript permits ordinary callable constructors here.
class Derived extends Base {
  own = initialize();
  constructor(value) {
    console.log("before");
    super(value);
    console.log("after");
  }
}
// @ts-expect-error JavaScript permits ordinary callable constructors here.
class Forwarded extends core.Base {}
class Leaf extends Forwarded {}
const original = core.Base.prototype;
core.Base.prototype = { label: "replacement", [core.key]: 0, describe() { return "replacement"; } };
original.label = "updated";
function inspect(value) {
  console.log(value.initial, value.label, value[core.key], value.describe());
}
inspect(new Derived("explicit"));
inspect(new Leaf("forwarded"));
