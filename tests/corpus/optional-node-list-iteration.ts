class Item {
  readonly value: number;
  constructor(value: number) { this.value = value; }
}

const entries: (Item | Item[] | undefined)[] = [new Item(1), [new Item(2), new Item(3)], undefined];
function lookup(index: number): Item | Item[] | undefined {
  return entries[index];
}

for (let index = 0; index < 4; index++) {
  const value = lookup(index);
  if (Array.isArray(value)) {
    for (const item of value) console.log("list", item.value);
  } else if (value !== undefined) console.log("node", value.value);
  else console.log("missing");
}

// A captured assignment can invalidate a checker narrow. The loop must
// validate the actual payload instead of reading an absent array pointer.
let captured: Item | Item[] | undefined = lookup(1);
function clear(): void { captured = undefined; }
if (Array.isArray(captured)) {
  clear();
  try {
    for (const item of captured) console.log("unreachable", item.value);
  } catch (error) {
    if (error instanceof Error) console.log(error.name);
  }
}
