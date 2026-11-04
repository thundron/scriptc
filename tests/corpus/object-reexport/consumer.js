import * as exported from "./barrel.js";
export function read() {
  const clone = { ...exported.prototype, value: "clone" };
  console.log(clone.describe(), clone[exported.marker]);
}
