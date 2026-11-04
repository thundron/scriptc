function Base(props) { Object.assign(this, props); }
function factory({ Base, label }) {
  return class extends Base {
    static label = label;
    constructor(props) { super(props); }
  };
}
const First = factory({ Base, label: "first" });
const Second = factory({ Base, label: "second" });
console.log(First.label, Second.label, new First({ value: 42 }).value);
function named(label) {
  class Named extends First {}
  Named.prototype.label = label;
  return Named;
}
const Named = named("prototype");
console.log(new Named({ value: 7 }).label, new Named({ value: 7 }).value);
