import { Base, FactoryInput, Input, Metrics, View, describeOptions, exerciseCachedStore, exerciseEnvironmentProxy } from "bundled-methods";

const view = new View("selected");
const base: Base = view;
console.log(JSON.stringify(new Base().selected()), view.selected(), base.getSelectedText());
console.log(view.label(), view.label("changed") === view, base.selected());
console.log(view.parent === null);
view.parent = new View("parent");
console.log(view.parent.selected());
view.parent = null;
const metrics = new Metrics(12, true);
console.log(metrics.count() + 1, metrics.active());

// The nullable base callback keeps one native slot through the bundled
// intermediate class and a derived arrow that captures its owner.
base.runLifecycle();
const callback = view.onLifecyclePass;
console.log(callback === view.onLifecyclePass);
base.resetLifecycle();
base.runLifecycle();
console.log(view.onLifecyclePass === null);
callback?.();
for (let i = 0; i < 20; i++) {
  const captured = new View(`iteration ${i}`);
  if (i === 19) captured.runLifecycle();
}

// The shipped declaration omits the private field's type. Its JavaScript
// constructor still identifies the class stored behind the null initializer.
const input = new Input();
const parser = input.save();
console.log("parser identity", parser === input.save());
input.push("hello");
input.push("!");
console.log(input.read(), parser?.read(), parser?.describe());
input.clear();
console.log(input.read(), parser?.read());
input.close();
input.push("ignored");
input.clear();
console.log(input.read(), input.save() === null, parser?.describe());
input.open();
console.log("replacement", input.save() === parser, input.read());

const factory = new FactoryInput();
console.log(factory.read());
factory.open("from factory");
const saved = factory.save();
console.log(factory.read(), saved === factory.save());
factory.close();
console.log(factory.read(), saved?.describe());
factory.open("replacement");
console.log(factory.read(), factory.save() === saved);
console.log(describeOptions({ name: "omitted" }));
console.log(describeOptions({ name: "present", required: false, default: 0, type: "number" }));
console.log(exerciseCachedStore());
console.log(exerciseEnvironmentProxy());
