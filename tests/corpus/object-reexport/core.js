export const marker = Symbol.for("object-reexport");
export const prototype = {
  [marker]: "tag",
  value: "original",
  describe() { return this.value; }
};
