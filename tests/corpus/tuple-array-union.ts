type Priority = readonly number[] | { rank: readonly number[] };

function describe(priority: Priority): string {
  return Array.isArray(priority) ? priority.join(":") : (priority as { rank: readonly number[] }).rank.join(":");
}

function withPriority<T>(priority: Priority, callback: () => T): T {
  console.log(describe(priority));
  return callback();
}

["first", "second"].forEach((name, index) => {
  const priority = [2, index] as const;
  console.log(withPriority(priority, () => name));
});
const direct: Priority = [3, 4] as const;
console.log(describe(direct));
console.log(describe({ rank: [5, 6] }));

type Mixed = readonly (number | string)[] | { label: string };
function showMixed(value: Mixed): void {
  console.log(Array.isArray(value) ? value.join(",") : (value as { label: string }).label);
}
const mixed = [7, "eight"] as const;
showMixed(mixed);
showMixed({ label: "record" });

type Rows = readonly { value: number }[] | { count: number } | undefined;
function showRows(rows: Rows): void {
  if (rows === undefined) { console.log("undefined"); return; }
  console.log(Array.isArray(rows) ? rows.map((row): number => row.value).join(",") : (rows as { count: number }).count);
}
const rows = [{ value: 9 }, { value: 10 }] as const;
showRows(rows);
showRows({ count: 11 });
showRows(undefined);
