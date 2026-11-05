const runtime = globalThis[Symbol.for("scriptc.test.runtime")];
beforeInitialization();
export var sleep = runtime?.sleep ?? standardSleep;
export var format = runtime?.format || standardFormat;
export var selected = runtime ? standardFormat : alternateFormat;
function beforeInitialization() {
  console.log(typeof sleep);
  try { sleep(0); } catch (error) { console.log(error.name); }
}
function standardSleep(value) { return Promise.resolve(value); }
function standardFormat(value) { return `standard:${value}`; }
function alternateFormat(value) { return `alternate:${value}`; }
export function replace() { sleep = (value) => Promise.resolve(value + 1); }
