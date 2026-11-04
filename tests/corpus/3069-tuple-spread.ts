// Fixed tuple spreads preserve positions, source order, and fresh storage.
let calls = 0;
const source: [string, number] = ["before", 2];
function take(): [string, number] {
  calls++;
  console.log("take", calls);
  return source;
}
function change(): string {
  console.log("change");
  source[0] = "after";
  source[1] = 9;
  return "tail";
}
function prefix(): boolean {
  console.log("prefix");
  return true;
}
const tuple: [boolean, string, number, string, string, number] = [prefix(), ...take(), change(), ...take()];
console.log(JSON.stringify(tuple), calls);
source[0] = "later";
tuple[1] = "copy";
console.log(JSON.stringify(source), JSON.stringify(tuple));

// Lexical field ordering must not reorder positions 10 and 11 before 2.
const many = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const combined = ["start", ...many, "end"] as const;
console.log(JSON.stringify(combined));

// The compiler builds its IR kind tables with this exact type-only pattern.
const kinds = ["number", "string"] as const satisfies readonly string[];
const moreKinds = [...kinds, "boolean"] as const;
console.log(JSON.stringify(moreKinds));

function empty(): [] {
  console.log("empty");
  return [];
}
const withEmpty: [number, string] = [...empty(), 3, ...empty(), "yes", ...empty()];
console.log(JSON.stringify(withEmpty));

// Spread slots use their destination types, including union wrapping.
const pair: [number, string] = [1, "two"];
const widened: [number | string, number | string, boolean] = [...pair, false];
console.log(JSON.stringify(widened));

// Elements are copied shallowly: referenced records retain their identity.
const record = { value: 1 };
const refs: [typeof record, string] = [record, "ref"];
const copied: [typeof record, string, number] = [...refs, 5];
record.value = 8;
console.log(JSON.stringify(copied));

// A throwing source prevents later elements from being evaluated.
function fail(): [number, string] {
  console.log("fail");
  throw new Error("spread failed");
}
try {
  const stopped: [boolean, number, string, string] = [prefix(), ...fail(), change()];
  console.log(JSON.stringify(stopped));
} catch (error) {
  if (error instanceof Error) console.log(error.message);
}
