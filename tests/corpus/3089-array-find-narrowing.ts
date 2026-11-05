export {};

type Leaf = { kind: "leaf"; value: number };
type Text = { kind: "text"; text: string };
type Empty = { kind: "empty" };
type Node = Leaf | Text | Empty;
const nodes: Node[] = [{ kind: "empty" }, { kind: "leaf", value: 3 }, { kind: "text", text: "middle" }, { kind: "leaf", value: 9 }];
const first = nodes.find((node) => node.kind === "leaf");
const last = nodes.findLast((node) => node.kind === "leaf");
console.log("leaf", first?.value, last?.value);
console.log("text", nodes.find((node) => node.kind === "text")?.text);
console.log("miss", nodes.slice(0, 1).find((node) => node.kind === "leaf") === undefined);

const mixed: (string | number | undefined)[] = [undefined, "first", 3, "last"];
console.log("scalars", mixed.find((value) => typeof value === "string"), mixed.findLast((value) => typeof value === "string"));
const present = mixed.find((value) => value !== undefined);
console.log("subunion", typeof present, present);
const empty: (string | number)[] = [];
console.log("empty", empty.find((value) => typeof value === "number"));

const sparse: string[] = [, "two", "three"] as string[];
let visits = "";
const found = sparse.find((value, index) => {
  visits += index + ":" + String(value) + ";";
  return typeof value === "string";
});
console.log("holes", visits, found);

const mutable: Node[] = [{ kind: "leaf", value: 42 }];
const saved = mutable.find((node) => {
  mutable[0] = { kind: "empty" };
  return node.kind === "leaf";
});
console.log("snapshot", saved?.value, mutable[0]!.kind);

let reverse = "";
const reverseFound = mixed.findLast((value, index) => {
  reverse += index + ";";
  return typeof value === "number";
});
console.log("reverse", reverse, reverseFound);

function acceptsWide(value: Node | undefined): boolean { return value?.kind === "text"; }
const wide = nodes.find(acceptsWide);
if (wide?.kind === "text") console.log("callback value", wide.text);
try {
  nodes.find((node) => {
    if (node.kind === "leaf") throw new Error("predicate");
    return node.kind === "text";
  });
} catch (error) {
  if (error instanceof Error) console.log("unwind", error.message);
}
