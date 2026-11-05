import * as Shapes from "effect4-shapes/semantics";

console.log(JSON.stringify(Shapes.openLocal((resume) => resume({ value: 42 }))));
console.log(JSON.stringify(Shapes.callbackResult(() => ({ value: 42 }))));
console.log(Shapes.callbackResult() === Symbol.for("shape/pending"));
console.log(Shapes.defaultObject(), Shapes.defaultObject({ value: 42 }));
console.log(JSON.stringify(Shapes.restArguments("first", "second")));
console.log(JSON.stringify(Shapes.openRecord()));
console.log(JSON.stringify(Shapes.advance(new Shapes.State())));
console.log(JSON.stringify(Shapes.copyProperties({ value: 42 })));
class Missing extends Shapes.Tagged("Missing") {}
const missing = new Missing({ message: "gone", id: 1 });
console.log(missing.name, missing._tag, missing.id, JSON.stringify(Object.keys(missing)));
console.log(JSON.stringify(Shapes.cached("value")));
console.log(JSON.stringify(Shapes.cached(Symbol.for("value"))));

class Nested extends Shapes.nestedFactory("a")("bc") {}
const nested = new Nested(39);
console.log(nested.value, nested.read());
class Receiver {
  value = 42;
  child = 1;
  method() { return this.value; }
  add(...args: number[]) { return this.value + args[0]! + args[1]!; }
}
const key = Symbol.for("shape/key");
console.log(JSON.stringify(Shapes.optionalReads(null, key)));
console.log(JSON.stringify(Shapes.optionalReads({ [key]: new Receiver() }, key)));
console.log(JSON.stringify(Shapes.missingProperties({ value: 42 })));
console.log(JSON.stringify([Shapes.dynamicIndex([1, 2], 1)]));
console.log(JSON.stringify([Shapes.dynamicIndex([1, 2], "length")]));
console.log(JSON.stringify(Shapes.callableProperties()));
const cached = new Shapes.Cached();
console.log(JSON.stringify(Shapes.readCached(cached)));
console.log(JSON.stringify(Object.getOwnPropertyDescriptor(cached, "result")));
console.log(JSON.stringify(Shapes.spreadMethod(new Receiver(), [1, 1])));

console.log(JSON.stringify(Shapes.templateProperties()));
console.log(JSON.stringify(Shapes.freezeValues()));
console.log(JSON.stringify(Shapes.prototypeRecord()));
console.log(JSON.stringify(Shapes.evolvingFields()));
const restKey = Symbol.for("rest/key");
const restSource = { omitted: 1, included: 2, [restKey]: 3 };
Object.defineProperty(restSource, "hidden", { value: 4 });
const rest = Shapes.objectRest(restSource);
console.log(JSON.stringify(rest));
console.log(JSON.stringify(Shapes.nativeSymbols(new Headers())));
console.log(JSON.stringify(Shapes.uriDecoders("%2f%3F%23%20%E2%82%AC")));
console.log(Shapes.clearStoredTimer());

console.log(JSON.stringify(Shapes.webConstructors()));
console.log(JSON.stringify(Shapes.stringPositions()));
console.log(Shapes.readDestructuredExports());
const yes = new Shapes.ConditionalDerived(true);
const no = new Shapes.ConditionalDerived(false);
console.log(yes.value, yes.initialized, no.value, no.initialized);

console.log(JSON.stringify(Shapes.collectionCopies()));

const backing = new Uint8Array([0, 65, 66, 0]).buffer;
console.log(JSON.stringify(Shapes.decodeViews(new DataView(backing, 1, 2))));
console.log(JSON.stringify(Shapes.decodeViews(new Uint16Array(backing, 0, 2))));
console.log(JSON.stringify(Shapes.decodeViews(backing)));

console.log(JSON.stringify(Shapes.mappedCollections()));

console.log(JSON.stringify(Shapes.spreadPush()));
console.log(JSON.stringify(Shapes.regexReset()));

console.log(JSON.stringify(Shapes.readOwnStatic()));
console.log(JSON.stringify(Shapes.arrayBufferBrand(backing)));
console.log(JSON.stringify(Shapes.arrayBufferBrand({})));

console.log(JSON.stringify(Shapes.surplusCallbacks()));
console.log(Shapes.ownStaticReceiver());
console.log(Shapes.inheritedStaticReceiver(), Shapes.detachedStaticReceiver());
console.log(JSON.stringify(Shapes.methodEvaluationOrder()));
console.log(JSON.stringify(Shapes.surplusNativeCallback()));
