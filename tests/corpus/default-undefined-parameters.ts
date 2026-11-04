// @transform-types
type Evaluate = (source: string, budget: number) => unknown;

class Host {
  constructor(private readonly evaluate: Evaluate | undefined = undefined) {}
  run(): unknown { return this.evaluate === undefined ? "missing" : this.evaluate("source", 2000); }
}
console.log(new Host().run());
console.log(new Host(undefined).run());
console.log(new Host((source, budget): unknown => source + budget).run());

function optional(callback: Evaluate | undefined = undefined): unknown {
  return callback === undefined ? "missing" : callback("function", 1000);
}
console.log(optional(), optional(undefined), optional((text, budget): unknown => text + budget));

let calls = 0;
function absent(): undefined { calls++; return undefined; }
function text(value: string | undefined = absent()): string {
  return value === undefined ? "absent" : value;
}
console.log(text(), calls, text("provided"), calls, text(undefined), calls);

function number(value: number | undefined = void (calls += 10)): number {
  return value === undefined ? -1 : value;
}
console.log(number(), calls, number(0), calls, number(undefined), calls);

class Base {
  constructor(public value: string | undefined = undefined) {}
  read(): string { return this.value ?? "base missing"; }
}
class Derived extends Base {
  constructor(value: string | undefined = undefined) { super(value); }
}
console.log(new Derived().read(), new Derived("present").read());

class Methods {
  label(value: string | undefined = undefined): string { return value ?? "method missing"; }
  static count(value: number | undefined = undefined): number { return value ?? -2; }
}
console.log(new Methods().label(), new Methods().label("method"));
console.log(Methods.count(), Methods.count(3));

const lambda = (value: string | undefined = undefined): string => value ?? "lambda missing";
console.log(lambda(), lambda("lambda"), lambda(undefined));

function generic<T>(fallback: T, value: T | undefined = undefined): T {
  return value === undefined ? fallback : value;
}
console.log(generic("fallback"), generic("fallback", "value"), generic(10), generic(10, 20));

let available = false;
function maybe(): string | undefined { return available ? "default" : undefined; }
function changing(value: string | undefined = maybe()): string { return value ?? "missing"; }
console.log(changing());
available = true;
console.log(changing(), changing("provided"));

// A default excludes an omitted argument only when its result does.
function required(value: string = "ordinary"): string { return value; }
console.log(required(), required(undefined), required("present"));
