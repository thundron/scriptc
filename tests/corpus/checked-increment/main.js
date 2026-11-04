export function increment(value) {
  console.log(value++, value, --value, value);
}
increment(3);
increment("7");
increment(2n);
increment(undefined);
increment({ valueOf() { return 9; } });
try { increment(Symbol("value")); } catch (error) { console.log(error.name, error.message); }

export const hash = str => {
  let h = 5381, i = str.length;
  while (i) h = h * 33 ^ str.charCodeAt(--i);
  return h;
};
console.log(hash("hello"), hash("world"));
