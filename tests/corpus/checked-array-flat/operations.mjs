export function flatten(values, depth) {
  return [values.get("outer"), values.get("record"), 5].flat(depth);
}
