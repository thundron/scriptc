export {};

type Item = { kind: "empty" } | { kind: "value"; value: number } | { kind: "text"; value: string };
function show(item: Item): string {
  switch (item.kind) {
    case "empty": return "empty";
    case "value": return "number " + item.value;
    case "text": return "string " + item.value;
  }
}
for (const json of ['{"kind":"empty"}', '{"kind":"value","value":7}', '{"kind":"text","value":"hello"}']) {
  console.log(show(JSON.parse(json) as Item));
}

// Identical field layouts can represent several source variants; all
// their literal values select the same native arm.
type Shared = { tag: "a"; value: string } | { tag: "b"; value: string } | { tag: "none" };
for (const json of ['{"tag":"a","value":"one"}', '{"tag":"b","value":"two"}', '{"tag":"none"}']) {
  const item = JSON.parse(json) as Shared;
  console.log("shared", item.tag, item.tag === "none" ? "absent" : item.value);
}

type Numeric = { tag: 0 } | { tag: 1; value: number } | { tag: 2; label: string };
for (const json of ['{"tag":0}', '{"tag":1,"value":12}', '{"tag":2,"label":"two"}']) {
  const item = JSON.parse(json) as Numeric;
  console.log("numeric", item.tag, item.tag === 1 ? String(item.value) : item.tag === 2 ? item.label : "zero");
}

type BooleanTag = { ok: false; message: string } | { ok: true; value: number };
for (const json of ['{"ok":false,"message":"failed"}', '{"ok":true,"value":23}']) {
  const item = JSON.parse(json) as BooleanTag;
  console.log("boolean", item.ok, item.ok ? String(item.value) : item.message);
}

type Optional = Item | null;
const rows = JSON.parse('[null,{"kind":"value","value":4},{"kind":"empty"}]') as Optional[];
for (const row of rows) console.log("optional", row === null || row === undefined ? "missing" : show(row));

// Both unions have the same record storage arms, but different literal
// contracts. Interning must not let the first one overwrite the second.
type First = { token: "one" } | { token: "two"; value: number };
type Second = { token: "red" } | { token: "blue"; value: number };
const first = JSON.parse('{"token":"two","value":5}') as First;
const second = JSON.parse('{"token":"blue","value":6}') as Second;
console.log("independent", first.token === "two" ? first.value : 0, second.token === "blue" ? second.value : 0);

// Escaped and Unicode discriminator strings retain exact literal values.
type Escaped = { tag: "a\"b"; value: number } | { tag: "日本語" };
const quoted = JSON.parse('{"tag":"a\\\"b","value":8}') as Escaped;
const unicode = JSON.parse('{"tag":"日本語"}') as Escaped;
console.log("escaped", quoted.tag === "a\"b" ? quoted.value : 0, unicode.tag);

// One layout may admit several literal kinds on the discriminator itself.
type Mixed = { tag: "text" | 1; value: string } | { tag: false; count: number };
for (const json of ['{"tag":"text","value":"one"}', '{"tag":1,"value":"two"}', '{"tag":false,"count":3}']) {
  const mixed = JSON.parse(json) as Mixed;
  console.log("mixed", mixed.tag === false ? String(mixed.count) : mixed.value);
}
