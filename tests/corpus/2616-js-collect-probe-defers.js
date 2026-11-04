// Collect-time initializer classification must not execute the guarded
// constructor. Constructor-assigned fields that shadow methods now lower
// statically, including in this untaken branch.
class A {
  constructor() {}
  foo() {
    return 4;
  }
}
class B extends A {
  constructor() {
    super();
    this.foo = () => 3;
  }
}
const make = process.env.SCRIPTC_NEVER === "yes";
if (make) {
  const i = new B();
  console.log("got", i.foo());
}
console.log("done");
