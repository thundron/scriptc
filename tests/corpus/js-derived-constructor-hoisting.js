class Base { constructor() { this.x = 1; } }
class Child extends Base {
  constructor() {
    before();
    super();
    let count = 2;
    after();
    after();
    this.x = count;
    function before() { console.log('before super'); }
    function after() { count++; console.log('after', count); }
  }
}
console.log(new Child().x);
