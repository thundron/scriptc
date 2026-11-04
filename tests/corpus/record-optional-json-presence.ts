interface Entry {
  name: string;
  synthesized?: true;
  count?: number;
}

function inspect(value: unknown): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return;
  const entry = value as Record<string, unknown>;
  console.log(entry.name, "synthesized" in entry, Object.hasOwn(entry, "synthesized"), entry.synthesized === true);
  console.log(Object.keys(entry).join(","), JSON.stringify(entry));
}

function make(name: string, synthesized: boolean): Entry {
  const entry: Entry = { name };
  if (synthesized) entry.synthesized = true;
  return entry;
}

const entries: Entry[] = [{ name: "declared" }, { name: "inline", synthesized: true }, make("built", false), make("generated", true)];
for (const entry of entries) inspect(JSON.parse(JSON.stringify(entry)));
const document = { entries };
const unknownDocument: unknown = JSON.parse(JSON.stringify(document));
if (unknownDocument !== null && typeof unknownDocument === "object") {
  const dict = unknownDocument as Record<string, unknown>;
  const items = dict.entries;
  if (Array.isArray(items)) for (const item of items) inspect(item);
}

// Boxing an explicitly present undefined value must retain its key.
inspect({ name: "undefined", synthesized: undefined });
inspect({ name: "undefined-count", count: undefined });
