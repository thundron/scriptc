// @transform-types
class Base { constructor(readonly value: number) {} }
class Derived extends Base { read(): number { return this.value; } }
class Other { constructor(readonly label: string) {} }
type Input = Base | Other | { value: number; label: string } | number | string | boolean | bigint | symbol | null | undefined;

let reads = 0;
function source(value: Input): Input { reads++; return value; }
function inspect(value: Input): void {
  console.log("kinds", source(value) instanceof Base, source(value) instanceof Derived, source(value) instanceof Other);
  if (value instanceof Base) console.log("base", value.value);
  if (value instanceof Derived) console.log("derived", value.read());
  if (value instanceof Other) console.log("other", value.label);
}
const inputs: Input[] = [new Base(1), new Derived(2), new Other("separate"), { value: 3, label: "record" }, 3, "text", false, 2n, Symbol("s"), null, undefined];
for (const input of inputs) inspect(input);
console.log("reads", reads);

class Node { constructor(readonly kind: number) {} get text(): string { return "node"; } }
function location(value?: Node | { document: string; position: number }): string {
  const node = value instanceof Node ? value : undefined;
  const position = value !== undefined && !(value instanceof Node) ? value : undefined;
  return node === undefined ? position?.document ?? "absent" : node.text;
}
console.log(location(new Node(1)), location({ document: "file.ts", position: 0 }), location());

const errors: (Error | { message: string } | undefined)[] = [new Error("base"), new TypeError("type"), { message: "record" }, undefined];
for (const error of errors) console.log("error", error instanceof Error, error instanceof TypeError);
