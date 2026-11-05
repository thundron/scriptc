type ValueType = { kind: "string" } | { kind: "dyn" };
type Expr =
  | { kind: "literal"; value: string; type: ValueType }
  | { kind: "object"; fields: { key: string; value: Expr }[]; type: ValueType }
  | { kind: "call"; args: Expr[]; name: string; type: ValueType };
const DYNAMIC: ValueType = { kind: "dyn" };

function assemble(groups: string[][]): Expr {
  let fields: { key: string; value: Expr }[] = [];
  let acc: Expr | null = null;
  const flush = (): void => {
    if (fields.length === 0) return;
    const chunk: Expr = { kind: "object", fields, type: DYNAMIC };
    acc = acc === null ? chunk : { kind: "call", args: [acc, chunk], name: "merge", type: DYNAMIC };
    fields = [];
  };
  for (const group of groups) {
    for (const key of group) fields.push({ key, value: { kind: "literal", value: key, type: { kind: "string" } } });
    flush();
    if (group.length > 10) {
      acc ??= { kind: "object", fields: [], type: DYNAMIC };
      acc = { kind: "call", args: [acc], name: "large", type: DYNAMIC };
    }
  }
  if (acc !== null) return acc;
  return { kind: "object", fields: [], type: DYNAMIC };
}

for (const groups of [[], [["headers"]], [["a"], ["b", "c"]]]) {
  const expression = assemble(groups);
  console.log(expression.kind, expression.type.kind, JSON.stringify(expression));
}

function inspect(expression: Expr): void {
  console.log(expression.kind, expression.type.kind, JSON.stringify(expression));
}

async function transfer(): Promise<Expr> {
  let value: Expr = { kind: "call", args: [], name: "initial", type: DYNAMIC };
  const replacement: Expr = { kind: "object", fields: [], type: DYNAMIC };
  const update = (): void => { value = replacement; };
  update();
  inspect(value);
  let assigned: Expr = { kind: "literal", value: "initial", type: DYNAMIC };
  assigned = value;
  inspect(assigned);
  const values: Expr[] = [value];
  const holder: { value: Expr | null } = { value };
  inspect(values[0]!);
  if (holder.value !== null) inspect(holder.value);
  console.log(values[0] === replacement, holder.value === replacement);
  return (value);
}

inspect(await transfer());

function subset(value: Expr): Expr | null {
  if (value.kind === "literal") {
    const selected: Extract<Expr, { kind: "literal" | "object" }> | null = value;
    return selected;
  }
  return null;
}
const selected = subset({ kind: "literal", value: "subset", type: DYNAMIC });
if (selected !== null) inspect(selected);
