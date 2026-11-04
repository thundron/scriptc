export const Base = (() => {
  class Base extends Error {
    describe() { return "base:" + this.message; }
  }
  return Base;
})();
