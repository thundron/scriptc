// A view whose entire value domain is unknown does not need a structural
// copy. It must keep the original dynamic object for mutation and identity.
const root: unknown = JSON.parse('{"child":{"name":"before"},"values":[1,2]}');
const view = root as Record<string, unknown>;
const alias = root as { child: unknown; values: unknown; missing?: unknown };
console.log(alias.child === view["child"], alias.values === view["values"]);
console.log(alias.missing === undefined);
const child = alias.child as Record<string, unknown>;
child["name"] = "after";
child["added"] = true;
console.log(JSON.stringify(root));
delete child["added"];
console.log(JSON.stringify(root));
(root as { child: unknown }).child = { name: "replaced" };
console.log(JSON.stringify(root));
console.log(JSON.stringify(child));

function rewrite(value: unknown): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return;
  const fields = value as Record<string, unknown>;
  delete fields["types"];
  fields["seen"] = true;
  for (const nested of Object.values(fields)) rewrite(nested);
}
const input: unknown = JSON.parse('{"types":"root.d.ts","child":{"types":"child.d.ts","value":3}}');
rewrite(input);
console.log(JSON.stringify(input));

let calls = 0;
function supplied(): unknown { calls++; return root; }
(supplied() as Record<string, unknown>)["extra"] = 5;
console.log(calls, (root as { extra?: unknown }).extra);
const first = supplied() as Record<string, unknown>;
const second = supplied() as Record<string, unknown>;
first["shared"] = "yes";
console.log(second["shared"], calls);
console.log(Object.keys(first).join(","));

// Fields with actual type constraints keep their checked conversion.
try {
  const invalid = JSON.parse('{"name":42}') as { name: string; rest: unknown };
  console.log(invalid.name.toUpperCase());
} catch (error) {
  console.log("checked", error instanceof TypeError);
}
const checked = JSON.parse('{"name":"valid","rest":{"data":true}}') as { name: string; rest: unknown };
console.log(checked.name.toUpperCase(), JSON.stringify(checked));

const present: unknown = JSON.parse('{"first":null,"last":false}');
console.log(Object.values(present as Record<string, unknown>).length);

// Later typed fields do not turn a dynamic spread source into a fixed
// record. Copy before evaluating overrides, retaining unmentioned keys.
const spreadSource: { child: unknown; keep: unknown } = { child: "before", keep: 2 };
let spreadOrder = "";
function readSpread(): { child: unknown; keep: unknown } {
  spreadOrder += "source";
  return spreadSource;
}
function overrideSpread(): string {
  spreadOrder += ",override";
  spreadSource.keep = 3;
  return "after";
}
const spreadCopy: { child: unknown; keep: unknown } = { ...readSpread(), child: overrideSpread() };
console.log(spreadOrder, JSON.stringify(spreadCopy), JSON.stringify(spreadSource));

// Function, return, annotated binding, and field boundaries keep the view.
function mutate(fields: Record<string, unknown>): Record<string, unknown> {
  fields["throughCall"] = true;
  return fields;
}
const annotated: Record<string, unknown> = root as Record<string, unknown>;
console.log(mutate(annotated) === annotated, (root as { throughCall?: unknown }).throughCall);
const holder: { label: string; value: Record<string, unknown> } = { label: "holder", value: annotated };
holder.value["field"] = "kept";
console.log(annotated["field"], holder.value === annotated);

function captured(raw: unknown): () => string {
  const update = (): string => {
    fields["captured"] = 4;
    return JSON.stringify(raw);
  };
  const fields = raw as Record<string, unknown>;
  return update;
}
console.log(captured(JSON.parse('{"initial":1}'))());

function hoisted(raw: unknown): string {
  const update = (): void => { fields["hoisted"] = true; };
  var fields = raw as Record<string, unknown>;
  update();
  var fields = raw as Record<string, unknown>;
  return JSON.stringify(fields);
}
console.log(hoisted(JSON.parse('{"initial":2}')));

const original = { left: 1, right: 2 };
const originalView = original as { left: unknown; right: unknown };
original.left = 7;
console.log(originalView.left);
originalView.right = 8;
console.log(original.right, originalView === (original as unknown));

function temporal(): void {
  const read = (): unknown => delayed["value"];
  const write = (): void => { delayed = { value: "changed" }; };
  try { read(); } catch (error) { console.log("tdz read", error instanceof ReferenceError); }
  try { write(); } catch (error) { console.log("tdz write", error instanceof ReferenceError); }
  let delayed: Record<string, unknown> = { value: "ready" };
  console.log(read());
  write();
  console.log(read());
}
temporal();
const empty = present as Record<string, unknown>;
delete empty["first"];
delete empty["last"];
console.log(Object.values(present as Record<string, unknown>).length);
