const prototype: object = { _tag: "Ready", count: 42 };
const value: unknown = Object.create(prototype);
function read(value: { readonly _tag: string; readonly count: number; missing?: string }) {
  console.log(value._tag, value.count, value.missing);
}
read(value as { _tag: string; count: number });
