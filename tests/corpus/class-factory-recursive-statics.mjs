function make(value) {
  return class Value {
    static value = value;
    static copy(next) { return make(next); }
  };
}
function transform(value) {
  return class Transformed extends make(value) {
    static copy(next) { return transform(next); }
  };
}
class Final extends transform("start").copy("end") {}
console.log(Final.value, Final.copy("again").value);
