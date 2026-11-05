class State {
  bytes;
  name;
  count;
  constructor() {
    console.log(typeof this.bytes, this.bytes ? "set" : "unset");
    console.log(typeof this.name, this.name ? "set" : "unset");
    console.log(typeof this.count, this.count === undefined);
    this.bytes = new Int32Array([7, 9]);
    this.name = "ready";
    this.count = 3;
    console.log(this.bytes ? this.bytes[1] : -1, this.name, this.count);
  }
  value() { return this.bytes[0]; }
}
console.log(new State().value());
