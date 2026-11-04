type Item = { kind: "value"; value: number } | { kind: "empty" };

function visit(items: Item[] | undefined): void {
  if (!items || !items.every((item) => item.kind === "value")) return;
  console.log(items.every((item) => item.value > 0));
  items.forEach((item, index) => console.log(index, item.value));
  console.log(items.flatMap((item) => [item.value, item.value + 1]).join(","));
  console.log(items.map((item, index, source) => {
    console.log("same", source === items);
    source[index]!.value += 1;
    return item.value;
  }).join(","));
  console.log(items.some((item) => item.value > 5));
  console.log(items.find((item) => item.value > 5)?.value ?? 0);
  console.log(items.filter((item) => item.value > 5).map((item) => item.value).join(","));
}
visit([{ kind: "value", value: 3 }, { kind: "value", value: 7 }]);
visit([{ kind: "empty" }]);
visit(undefined);

function labels(values: (string | null)[] | undefined): void {
  if (!values || !values.every((value): value is string => value !== null)) return;
  values.forEach((value, index) => console.log(index, value));
  console.log(values.flatMap((value) => [value, value + "!"]).join(","));
}
labels(["one", "two"]);
labels([null]);
labels(undefined);
