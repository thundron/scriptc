// Inference calls captures strings, but unmatched groups store undefined.
/** @param {string|number} name */
function resolveName(name) {
  if (name === undefined || name === "") return "root";
  return String(name);
}
class Binding {
  /** @param {Object} parsed */
  constructor(parsed) {
    this.parsed = parsed;
    console.log("resolved", resolveName(this.parsed.nodeName));
  }
}
for (const text of ["", "left", "left.right"]) {
  const match = /^(?:(\w+)(?:\.(\w+))?)?$/.exec(text);
  if (match === null) throw new Error("missing match");
  const result = { nodeName: match[1], propertyName: match[2] };
  const lastDot = result.nodeName && result.nodeName.lastIndexOf(".");
  console.log(text, result.nodeName === undefined, lastDot, JSON.stringify(result));
  if (result.nodeName !== undefined) console.log(result.nodeName.toUpperCase());
  console.log(result.propertyName?.toUpperCase());
  new Binding(result);
  try {
    console.log(result.propertyName.length);
  } catch (error) {
    console.log(error.name, error.message);
  }
}
