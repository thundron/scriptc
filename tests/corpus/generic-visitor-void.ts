// Generic visitor result types can be void, undefined, or real values.
// Every callback still runs exactly once; only truthy results stop a walk.
class Visitor {
  each<T>(visit: (value: number) => T, visitList?: (values: number[]) => T): T | undefined {
    const values = [0, 1, 2];
    if (visitList !== undefined) {
      const result = visitList(values);
      if (result) return result;
    }
    for (const value of values) {
      const result = visit(value);
      if (result) return result;
    }
    return undefined;
  }

  store<T = void>(visit: () => T): string {
    let result: T;
    result = visit();
    return typeof result;
  }
}

function once<T>(visit: () => T): T | undefined {
  const value = visit();
  return value;
}

const visitor = new Visitor();
let total = 0;
visitor.each((value) => { total += value; console.log("void", value); });
console.log("total", total);
visitor.each<void>((value) => { console.log("explicit", value); });
visitor.each((value) => { console.log("undefined", value); return undefined; });
visitor.each((value) => { console.log("element", value); }, (values) => { console.log("list", values.length); });
console.log("number", visitor.each((value) => value));
console.log("boolean", visitor.each((value) => value === 2));
console.log("string", visitor.each((value) => value === 2 ? "found" : ""));
console.log("list result", visitor.each((value) => value, (values) => values.length));
console.log("store", visitor.store(() => { console.log("stored void"); }));
console.log("explicit store", visitor.store<void>(() => { console.log("stored explicit"); }));
console.log("value store", visitor.store(() => 42));
once(() => { console.log("once void"); });
console.log("once value", once(() => 42));

// A generic wrapper forwards the symbolic return type to a generic method.
function forwarded<T>(visit: (value: number) => T | undefined): T | undefined {
  return visitor.each(visit);
}
function forwardedAgain<T>(visit: (value: number) => T | undefined): T | undefined {
  return forwarded(visit);
}
forwarded((value) => { console.log("forward visit", value); });
forwardedAgain((value) => { console.log("forward again visit", value); });
console.log("forwarded bool", forwarded((value) => value === 2 ? true : undefined));
console.log("forwarded false", forwardedAgain((value) => value === 2 ? false : undefined));
console.log("forwarded number", forwardedAgain((value) => value === 2 ? 17 : undefined));
console.log("forwarded string", forwardedAgain((value) => value === 2 ? "found" : undefined));
