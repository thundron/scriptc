import * as core from "./base.js";
function derive(suffix) {
  return class extends core.Base {
    constructor(message) { super(message); }
    describe() { return super.describe() + suffix; }
  };
}
const First = derive("!");
const Second = derive("?");
const first = new First("one");
const second = new Second("two");
console.log(first.describe(), second.describe());
console.log(first instanceof core.Base, first instanceof Error);
console.log(first instanceof First, first instanceof Second);
