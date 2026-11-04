class Item {
  value: number;
  constructor(value: number) { this.value = value; }
}
function inspect(item: Item): number { return item.value; }
function forward(item: Item): number { return inspect(item); }
function fail(item: Item): number {
  if (item.value < 0) throw new RangeError("negative item");
  return forward(item);
}

function exits(items: Item[]): number {
  let total = 0;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    try {
      if (item.value === 2) continue;
      if (item.value === 5) break;
      total += fail(item);
    } catch (error) {
      if (error instanceof Error) console.log(error.name, error.message);
      total += 100;
    } finally {
      total += forward(item);
    }
  }
  return total;
}
console.log(exits([new Item(1), new Item(2), new Item(-3), new Item(4), new Item(5), new Item(6)]));

function early(items: Item[], mode: number): number {
  const item = items[0];
  try {
    if (mode === 0) return forward(item);
    if (mode === 1) throw new Error("body");
    return fail(item);
  } finally {
    items.length = 0;
    console.log("finally", forward(item));
    if (mode === 2) return forward(item) + 1;
  }
}
console.log(early([new Item(7)], 0));
try { console.log(early([new Item(11)], 1)); }
catch (error) { if (error instanceof Error) console.log(error.message); }
console.log(early([new Item(13)], 2));

function nested(items: Item[]): number {
  const item = items[0];
  try {
    try { return fail(item); }
    finally { console.log("inner", forward(item)); }
  } catch (error) {
    items.length = 0;
    if (error instanceof Error) console.log("catch", error.name);
    return forward(item);
  } finally {
    console.log("outer", forward(item));
  }
}
console.log(nested([new Item(-17)]));

function switchPaths(items: Item[], choice: number): number {
  switch (choice) {
    case 0: {
      const item = items[0];
      return forward(item);
    }
    case 1: {
      const item = items[1];
      items.length = 0;
      return forward(item);
    }
    default: return -1;
  }
}
console.log(switchPaths([new Item(19), new Item(23)], 0));
console.log(switchPaths([new Item(29), new Item(31)], 1));
console.log(switchPaths([], 9));

function repeated(): number {
  let total = 0;
  for (let i = 0; i < 20; i++) {
    const items = [new Item(i)];
    const item = items[0];
    items.length = 0;
    total += forward(item);
  }
  return total;
}
console.log(repeated());
