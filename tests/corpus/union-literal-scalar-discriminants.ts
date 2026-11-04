// Distinct scalar discriminator kinds must not collide when selecting an
// object-literal destination. Payload unions require their own conversion.
type Payload = { kind: "text"; text: string } | { kind: "count"; count: number };
type Numeric =
  | { code: 0; payload: Payload; zero: string }
  | { code: -2.5; payload: Payload; negative: number }
  | { code: 7; payload: Payload };
type BooleanChoice =
  | { enabled: false; payload: Payload; disabled: string }
  | { enabled: true; payload: Payload };
type Mixed =
  | { tag: "1"; payload: Payload; stringOnly: string }
  | { tag: 1; payload: Payload; numberOnly: number }
  | { tag: false; payload: Payload; booleanOnly: boolean };

function payload(value: Payload): string { return value.kind === "text" ? value.text : `${value.count}`; }
function zero(value: Payload): Numeric { return { code: 0, payload: value, zero: "zero" }; }
function negative(value: Payload): Numeric { return { code: -2.5, payload: value, negative: 17 }; }
function seven(value: Payload): Numeric { return { code: 7, payload: value }; }
function numeric(value: Numeric): string {
  switch (value.code) {
    case 0: return `${value.zero}:${payload(value.payload)}`;
    case -2.5: return `${value.negative}:${payload(value.payload)}`;
    case 7: return `seven:${payload(value.payload)}`;
  }
}
function disabled(value: Payload): BooleanChoice { return { enabled: false, payload: value, disabled: "disabled" }; }
function enabled(value: Payload): BooleanChoice { return { enabled: true, payload: value }; }
function boolean(value: BooleanChoice): string { return `${value.enabled ? "enabled" : value.disabled}:${payload(value.payload)}`; }
function stringTag(value: Payload): Mixed { return { tag: "1", payload: value, stringOnly: "string" }; }
function numberTag(value: Payload): Mixed { return { tag: 1, payload: value, numberOnly: 19 }; }
function booleanTag(value: Payload): Mixed { return { tag: false, payload: value, booleanOnly: true }; }
function mixed(value: Mixed): string {
  if (value.tag === "1") return `${value.stringOnly}:${payload(value.payload)}`;
  if (value.tag === 1) return `${value.numberOnly}:${payload(value.payload)}`;
  return `${value.booleanOnly}:${payload(value.payload)}`;
}
const inputs: Payload[] = [{ kind: "text", text: "retained" }, { kind: "count", count: 31 }];
for (const input of inputs) {
  console.log("numeric", numeric(zero(input)), numeric(negative(input)), numeric(seven(input)));
  console.log("boolean", boolean(disabled(input)), boolean(enabled(input)));
  console.log("mixed", mixed(stringTag(input)), mixed(numberTag(input)), mixed(booleanTag(input)));
}

type Aliases =
  | { kind: "a" | "b"; payload: Payload; value: number }
  | { kind: "c"; payload: Payload };
function aliased(kind: "a" | "b", value: Payload): Aliases { return { kind, payload: value, value: 41 }; }
function aliasText(value: Aliases): string {
  return value.kind === "c" ? payload(value.payload) : `${value.kind}:${value.value}:${payload(value.payload)}`;
}
console.log("aliases", aliasText(aliased("a", inputs[0]!)), aliasText(aliased("b", inputs[1]!)));

type Keys =
  | { kind: "constructor"; payload: Payload; constructorOnly: string }
  | { kind: "__proto__"; payload: Payload; protoOnly: number }
  | { kind: "\u0000"; payload: Payload };
function constructor(value: Payload): Keys { return { kind: "constructor", payload: value, constructorOnly: "own" }; }
function proto(value: Payload): Keys { return { kind: "__proto__", payload: value, protoOnly: 43 }; }
function nul(value: Payload): Keys { return { kind: "\u0000", payload: value }; }
function keyText(value: Keys): string {
  switch (value.kind) {
    case "constructor": return `${value.constructorOnly}:${payload(value.payload)}`;
    case "__proto__": return `${value.protoOnly}:${payload(value.payload)}`;
    case "\u0000": return `nul:${payload(value.payload)}`;
  }
}
console.log("keys", keyText(constructor(inputs[0]!)), keyText(proto(inputs[1]!)), keyText(nul(inputs[0]!)));

// A spread may replace the discriminator. Selection must use the final
// checker-known value without evaluating either source more than once.
const calls: string[] = [];
function base(): { tag: "1"; payload: Payload; stringOnly: string } {
  calls.push("base");
  return { tag: "1", payload: inputs[0]!, stringOnly: "discarded" };
}
function readNumber(): number { calls.push("number"); return 53; }
function replaced(): Mixed { return { ...base(), tag: 1, numberOnly: readNumber() }; }
console.log("replaced", mixed(replaced()), calls.join(","));

function withUndefined(value: Mixed | undefined): Mixed | undefined { return value; }
const candidate = withUndefined(numberTag(inputs[1]!));
console.log("optional", candidate ? mixed(candidate) : "missing", withUndefined(undefined) === undefined);
let total = 0;
for (let i = 0; i < 100; i++) {
  const result = negative(inputs[i % inputs.length]!);
  if (result.code === -2.5) total += result.negative;
}
console.log("repeated", total);
