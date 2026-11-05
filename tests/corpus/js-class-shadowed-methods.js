class C {
  constructor() {
    this.foo = () => {
      console.log("called arrow");
    };
  }
  foo() {
    console.log("called method");
  }
}

class D extends C {
  foo() {
    console.log("SUPER:");
    super.foo();
    console.log("THIS:");
    this.foo();
  }
}

const obj = new D();
obj.foo();
D.prototype.foo.call(obj);

class NonCallable {
  constructor() { this.m = 'not callable'; }
  m() { console.log('unreached'); }
}
try { new NonCallable().m(); } catch (error) { console.log(error.name, error.message.includes('is not a function')); }
class Clean { foo() { return 4; } }
class Callable extends Clean { constructor() { super(); this.foo = () => 3; } }
console.log(new Callable().foo(), Clean.prototype.foo.call(new Callable()));
