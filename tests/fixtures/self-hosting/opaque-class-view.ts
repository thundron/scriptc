class Context {
  readonly values = new Map<string, number>();
  readonly members = new Set<string>();
  readonly count = (...values: number[]): number => values.length;
  value = 7;
  bump(): number { this.values.set("value", ++this.value); return this.value; }
}
function throughUnknown(value: unknown): unknown { return value; }
const original = new Context();
const opaque = throughUnknown(original);
for (let i = 0; i < 3; i++) {
  try { JSON.stringify(opaque); throw new Error("view should refuse"); }
  catch (error) {
    if (!(error instanceof TypeError) || !error.message.includes("class fields")) throw error;
  }
  const restored = opaque as Context;
  if (restored !== original || restored.bump() !== 8 + i) throw new Error("capsule identity lost");
  if (restored.count(1, 2) !== 2) throw new Error("native rest callback lost");
}
console.log(original.values.get("value"), original.members.size);
