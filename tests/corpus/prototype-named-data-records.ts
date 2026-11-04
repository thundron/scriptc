interface Entry { args: number[]; result: string }

// Contextual lookup may see Object.prototype's methods, but these own
// properties hold ordinary data records, including inside nested tables.
const table = {
  methods: {
    toString: { args: [2, 3], result: "string data" },
    valueOf: { args: [4], result: "value data" },
    hasOwnProperty: { args: [5], result: "ownership data" },
    toLocaleString: { args: [6], result: "locale data" },
    constructor: { args: [7], result: "constructor data" },
    plain: { args: [8], result: "ordinary data" },
  } as Record<string, Entry | undefined>,
};

for (const name of Object.keys(table.methods)) {
  const entry = table.methods[name];
  if (entry !== undefined) console.log(name, entry.args.join(","), entry.result);
}
console.log(Object.keys(table.methods).join(","));
console.log(JSON.stringify(table));

let order = "";
function entry(name: string, value: number): Entry {
  order += name + ";";
  return { args: [value], result: name };
}
const effects = {
  toString: entry("first", 1),
  valueOf: { args: [2], result: entry("second", 2).result },
  toLocaleString: entry("third", 3),
} as Record<string, Entry>;
console.log(order, effects["toString"].result, effects["valueOf"].result, effects["toLocaleString"].result);

function make(value: number): Record<string, Entry> {
  return {
    toString: { args: [value], result: "return" },
    valueOf: { args: [value + 1], result: "return value" },
  };
}
const returned = make(10);
console.log(JSON.stringify(returned));
const first = returned["toString"];
const second = returned["valueOf"];
first.args.push(12);
second.result = "updated";
console.log(JSON.stringify(returned));

// Real callable properties retain their callable behavior.
const callable = { toString: (): string => "callable" };
console.log(callable.toString());
