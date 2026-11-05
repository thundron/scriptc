export {};

type Tree = { kind: "leaf"; value: string } | { kind: "branch"; children: Tree[] };
function visit(tree: Tree): string {
  switch (tree.kind) {
    case "leaf": return tree.value;
    case "branch": return tree.children.map(visit).join("|");
    default: {
      const exhaustive: never = tree;
      void exhaustive;
      throw new Error("unknown tree");
    }
  }
}
console.log(visit({ kind: "branch", children: [{ kind: "leaf", value: "one" }, { kind: "leaf", value: "two" }] }));

function scalar(value: "left" | "right"): number {
  switch (value) {
    case "left": return 1;
    case "right": return 2;
    default: {
      const exhaustive: never = value;
      void exhaustive;
      throw new Error("unknown scalar");
    }
  }
}
console.log(scalar("left"), scalar("right"));

// A never assertion can make a witness reachable. Preserve the original
// runtime value and initialization effects instead of inventing a number
// or dropping the declaration.
let reads = 0;
function text(): string { reads++; return "kept"; }
function forced(): void {
  const value: never = text() as never;
  console.log(value, reads);
  const object: never = { label: "object", values: [1, 2] } as never;
  console.log(JSON.stringify(object));
  const closure: never = (() => "called") as never;
  console.log((closure as () => string)());
}
forced();

// Initializer exceptions still leave the following statements unreachable.
function fail(): string { throw new Error("initializer failed"); }
try {
  const value: never = fail() as never;
  console.log(value, "unreachable");
} catch (error) {
  if (error instanceof Error) console.log(error.message);
}

type Selected = Tree & { kind: "leaf" };
function onlyLeaf(tree: Selected): string {
  if (tree.kind === "leaf") return tree.value;
  const exhaustive: never = tree as never;
  void exhaustive;
  throw new Error("unknown leaf");
}
console.log(onlyLeaf({ kind: "leaf", value: "selected" }));
