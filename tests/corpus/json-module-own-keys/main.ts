import rows from "./rows.json" with { type: "json" };
const raw: unknown = rows;
const values = raw as Record<string, unknown>[];
for (const row of values) {
  console.log(Object.keys(row).join(","));
  console.log(Object.hasOwn(row, "a"), Object.hasOwn(row, "b"), Object.hasOwn(row, "toString"));
  console.log(JSON.stringify(row));
}
