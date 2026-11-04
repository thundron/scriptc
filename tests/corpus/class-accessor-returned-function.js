let reads = 0;
class Provider {
  get callable() {
    reads++;
    return function(value) { return value + 1; };
  }
}
const provider = new Provider();
console.log(provider.callable(4), reads);
class PrivateProvider {
  #method(value = 2) { return value + 3; }
  get method() { return this.#method; }
}
console.log(new PrivateProvider().method());
