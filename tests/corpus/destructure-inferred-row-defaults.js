function defineStruct(fields, options) {
  const layout = [];
  for (const [name, type, settings = {}] of fields) {
    layout.push({ name, type, default: settings.default });
  }
  return layout;
}
const a = defineStruct([["first", "number", { default: 7 }], ["second", "number"]]);
const b = defineStruct([["name", "string", { default: "yes" }]], {});
console.log(a.length, a[0].default, a[1].default, b[0].default);
