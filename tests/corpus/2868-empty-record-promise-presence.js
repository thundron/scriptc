function run() {
    const empty = {};
    let keyReads = 0;
    function key() {
      keyReads++;
      return "missing";
    }
    console.log(empty[key()] === undefined, keyReads);
}

run();

/** @param {Promise<string> | undefined} promise */
function isThenable(promise) {
  if (promise && promise.then && typeof promise.then === "function") return true;
  return false;
}

console.log(isThenable(undefined), isThenable(Promise.resolve("ready")));

/** @param {Promise<string> | undefined} promise */
function optionalThenable(promise) {
  if (promise?.then && typeof promise.then === "function") return true;
  return false;
}
console.log(optionalThenable(undefined), optionalThenable(Promise.resolve("ready")));
