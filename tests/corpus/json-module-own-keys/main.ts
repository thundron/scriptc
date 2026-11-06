import rows from "./rows.json" with { type: "json" };
import sameKeys from "./same-keys.json" with { type: "json" };
const raw: unknown = rows;
const values = raw as Record<string, unknown>[];
for (const row of values) {
  console.log(Object.keys(row).join(","));
  console.log(Object.hasOwn(row, "a"), Object.hasOwn(row, "b"), Object.hasOwn(row, "toString"));
  console.log(JSON.stringify(row));
}
for (const row of sameKeys) {
  console.log(Object.keys(row).join(","), JSON.stringify(row));
}
const sameUnknown: unknown = sameKeys;
const sameViews = sameUnknown as Record<string, unknown>[];
for (const row of sameViews) {
  console.log(Object.keys(row).join(","), JSON.stringify(row));
}
sameKeys[1]!.a = 7;
console.log(Object.keys(sameViews[1]!).join(","), JSON.stringify(sameViews[1]));
console.log(JSON.stringify(sameKeys));
