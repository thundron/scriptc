export const key = Symbol.for("test/function-base");
export const Base = (() => {
  function Constructor(value) {
    console.log("base", value);
    this.initial = value;
  }
  Constructor.prototype = {
    label: "original",
    [key]: 17,
    describe() { return this.label + ":" + this.initial; }
  };
  return Constructor;
})();
