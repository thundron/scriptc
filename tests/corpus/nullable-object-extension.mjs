function base(enabled) {
  if (!enabled) return null;
  return { value: 7 };
}
function extended(enabled) {
  const result = base(enabled);
  if (result) {
    result.extra = { value: 42 };
    const alias = result;
    alias.label = "ready";
  }
  return result;
}
console.log(extended(false) === null);
const result = extended(true);
console.log(result.value, result.extra.value, result.label);
