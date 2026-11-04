type Rect = { width: number };
type Item = { rect?: Rect };

function hasRect(item: Item): item is Item & { rect: Rect } {
  return item.rect !== undefined;
}

function hasRequiredRect(item: Item): item is { rect: Rect } {
  return item.rect !== undefined;
}

function totalWidth(items: Item[]): number {
  let total = 0;
  for (const item of items) {
    if (!hasRect(item)) continue;
    total += item.rect.width;
  }
  return total;
}

function parameter(item: Item): number {
  if (!hasRect(item)) return -1;
  return item.rect.width;
}

function local(items: Item[], index: number): number {
  const item = items[index];
  if (item === undefined || !hasRect(item)) return -1;
  return item.rect.width;
}

function truthy(items: Item[], index: number): number {
  const item: Item | undefined = items[index];
  if (!item || !hasRect(item)) return -1;
  return item.rect.width;
}

function separate(items: Item[], index: number): number {
  const item = items.length > index ? items[index] : undefined;
  if (item === undefined) return -1;
  if (!hasRequiredRect(item)) return -1;
  return item!["rect"].width;
}

function forwarded(items: Item[], index: number): number {
  const item = items[index];
  if (item === undefined) return -1;
  return parameter(item);
}

function captured(items: Item[]): () => number {
  const item = items[0];
  if (item === undefined || !hasRect(item)) return () => -1;
  return () => item.rect.width;
}

const items: Item[] = [{ rect: { width: 3 } }, {}, { rect: { width: 4 } }];
console.log("for-of", totalWidth(items));
console.log("map", items.map((item) => hasRect(item) ? item.rect.width : -1).join(","));
console.log("from", Array.from(items, (item) => hasRequiredRect(item) ? item.rect.width : -1).join(","));
let sum = 0;
items.forEach((item) => { if (hasRect(item)) sum += item.rect.width; });
console.log("forEach", sum);
for (let index = 0; index < 4; index++) {
  console.log("local", index, local(items, index), truthy(items, index), separate(items, index), forwarded(items, index));
}
console.log("capture", captured(items)(), captured([{}])(), captured([])());

// Refinement must preserve the original object and optional field storage.
function replaceRect(items: Item[]): void {
  const item = items[0];
  if (hasRect(item)) item.rect = { width: item.rect.width + 1 };
}
replaceRect(items);
console.log("mutation", totalWidth(items));

// Narrowing to an existing arm of a multi-value union remains supported.
type Present = { rect: Rect };
type Label = { label: string };
function isPresent(item: Present | Label): item is Present { return "rect" in item; }
const mixed: (Present | Label)[] = [{ rect: { width: 5 } }, { label: "plain" }];
for (const item of mixed) {
  if (isPresent(item)) console.log("union arm", item.rect.width);
}

// A strengthened type cannot erase the missing element at runtime, even
// if a user predicate incorrectly claims it is present.
function claimsRect(item: Item): item is Item & { rect: Rect } {
  return true;
}

function missing(items: Item[]): void {
  const item = items[9];
  if (claimsRect(item)) console.log(item.rect.width);
}

try {
  missing(items);
} catch (error) {
  console.log("missing", error instanceof TypeError, (error as Error).message);
}
