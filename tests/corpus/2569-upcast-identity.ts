// Identity compares across hierarchy upcasts: one object retained and
// released through BOTH its base-typed and derived-typed spellings in a
// single statement frame, plus a freshly constructed operand in the same
// call — the emitted LLVM type-puns the object header through both struct
// types, which clang's TBAA at -O2 used to miscompile into a premature
// free (the global still owned the object when release_globals ran).
class Base {
  tag = "b";
}
class Derived extends Base {
  extra = 1;
}
class Deeper extends Derived {
  more = "m";
}

const d = new Derived();
const asBase: Base = d;

// The original SIGSEGV shape: upcast identity plus a constructing compare
// inside one console.log call.
console.log(asBase === d, asBase === new Base());

// Both operand orders, and !== through the same upcast.
console.log(d === asBase, asBase !== d, d !== asBase);

// A three-deep hierarchy viewed at every level: all four spellings of the
// same object must agree, and the base view must not claim the sibling.
const deep = new Deeper();
const mid: Derived = deep;
const top: Base = deep;
console.log(top === mid, mid === deep, top === deep, deep === top);
console.log(top === d, top !== d, mid !== asBase);

// Constructing operands on either side, and on both sides at once.
console.log(new Base() === asBase, new Derived() !== new Base());

// Standalone expression statements: the compare's temps (including the
// constructed operand) release at statement end with nobody consuming the
// result.
asBase === new Base();
deep === top;

// The upcast views still work — and the objects are still alive — after
// every compare above.
console.log(asBase.tag, mid.extra, top === asBase, deep.more);
