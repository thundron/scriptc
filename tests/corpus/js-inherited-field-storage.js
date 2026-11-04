class Base {
  constructor() { this.name = ""; this.count = 1; }
  read() { return this.name; }
  async readAsync() { return this.name; }
}
class Child extends Base {
  constructor(name = null) { super(); this.name = name; }
}
class Grandchild extends Child {
  constructor(name = null) { super(name); this.count = name; }
}
class Sibling extends Base {
  constructor() { super(); this.name = "sibling"; }
}
const base = new Base();
const child = new Child();
const named = new Child("named");
const grandchild = new Grandchild();
const sibling = new Sibling();
console.log(base.read(), child.read(), named.read(), grandchild.read(), sibling.read());
console.log(base.count, child.count, grandchild.count, sibling.count);
class DeclaredBase {
  name = "base";
  read() { return this.name; }
}
class DeclaredChild extends DeclaredBase {
  // @ts-expect-error JavaScript permits a subclass to replace the inherited value.
  name = null;
}
console.log(new DeclaredBase().read(), new DeclaredChild().read());
const key = "token";
class ComputedBase {
  [key] = 1;
  read() { return this[key]; }
}
class ComputedChild extends ComputedBase {
  // @ts-expect-error JavaScript permits a subclass to replace the inherited value.
  [key] = null;
}
console.log(new ComputedBase().read(), new ComputedChild().read());
class UpdatedBase {
  constructor() { this.value = 1; }
  read() { return this.value; }
}
class UpdatedChild extends UpdatedBase {
  set(value) { this.value = value; }
  clear() { const reset = () => { this.value = null; }; reset(); }
  replace = value => { this.value = value; };
}
const updated = new UpdatedChild();
updated.set("updated");
console.log(updated.read());
const AnonymousBase = class {
  constructor() { this["label"] = "base"; }
  read() { return this["label"]; }
};
const AnonymousChild = class extends AnonymousBase {
  constructor(label = null) { super(); this["label"] = label; }
};
console.log(new AnonymousBase().read(), new AnonymousChild().read());
console.log("async", await child.readAsync(), await named.readAsync());
updated.clear();
console.log(updated.read());
updated.replace("arrow");
console.log(updated.read());
