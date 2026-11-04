interface Entry { name: string; values: number[]; disabled?: boolean }
const entries: Entry[] = [
  { name: "one", values: [1] },
  { name: "two", values: [2], disabled: true },
];

function copyPair(leftIndex: number, rightIndex: number, stop: boolean): Entry[] {
  const left = entries[leftIndex];
  const right = entries[rightIndex];
  if (!left || !right || stop) return [];
  return [{ ...left, name: "left:" + left.name }, { ...right, name: "right:" + right.name }];
}
for (const [left, right, stop] of [[0, 1, false], [3, 1, false], [0, 3, false], [0, 1, true]] as [number, number, boolean][]) {
  const copied = copyPair(left, right, stop);
  console.log("pair", copied.map((entry) => entry.name).join(","));
  if (copied.length) console.log("shared", copied[0]!.values === entries[0]!.values);
}

function copyLoop(): Entry[] {
  const out: Entry[] = [];
  for (let i = 0; i < 4; i++) {
    const first = entries[i];
    const second = entries[0];
    if (!first || !second || first.disabled) continue;
    out.push({ ...first, name: first.name + second.name });
  }
  return out;
}
console.log("continue", copyLoop().map((entry) => entry.name).join(","));

function stopLoop(index: number): void {
  const item = entries[index];
  for (let i = 0; i < 1; i++) {
    if (!item) break;
    const copy = { ...item };
    console.log("inside", copy.name);
  }
  console.log("outside", item === undefined);
}
stopLoop(0);
stopLoop(8);

function branchScope(index: number, visit: boolean): void {
  const item = entries[index];
  if (visit) {
    if (!item) return;
    console.log("branch", { ...item }.name);
  }
  console.log("after-branch", item === undefined);
}
branchScope(0, true);
branchScope(8, false);
branchScope(8, true);

function assignedInGuard(): void {
  let item = entries[0];
  if (item && !(item = entries[9])) console.log("guard-assignment", item === undefined);
}
assignedInGuard();

function assignedAfterGuard(): void {
  let item = entries[0];
  if (!item) return;
  item = entries[9];
  console.log("later-assignment", item === undefined);
  try { console.log(item.name); }
  catch (error) { if (error instanceof TypeError) console.log("absent-read", error.name); }
}
assignedAfterGuard();

function negatedGuard(index: number): void {
  const item = entries[index];
  if (!!item) console.log("double-negation", { ...item }.name);
}
negatedGuard(0);
negatedGuard(9);

// A jump to another case must not inherit the first case's early guard.
function switchScope(index: number, mode: number): void {
  const item = entries[index];
  switch (mode) {
    case 0:
      if (!item) break;
      console.log("case-zero", { ...item }.name);
      break;
    case 1:
      console.log("case-one", item === undefined);
      break;
  }
}
switchScope(0, 0);
switchScope(9, 0);
switchScope(9, 1);

function indexed(index: number): string {
  const position = [0, 1][index];
  if (position === undefined) return "absent";
  return entries[position]!.name;
}
function looseIndexed(index: number): string {
  const position = [0, 1][index];
  if (position == null) return "absent";
  return entries[position]!.name;
}
console.log("equality", indexed(0), indexed(1), indexed(8));
console.log("loose", looseIndexed(0), looseIndexed(1), looseIndexed(8));

function capturedGuard(index: number): void {
  let item = entries[index];
  function clear(): boolean { item = entries[9]; return true; }
  if (item && clear()) {
    console.log("capture-cleared", item === undefined);
    try { console.log(item.name); }
    catch (error) { if (error instanceof TypeError) console.log("capture-read", error.name); }
  }
}
capturedGuard(0);
capturedGuard(9);
