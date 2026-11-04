/**
 * @param {unknown} expectedErrorConstructor
 * @param {() => unknown} func
 * @returns {"pass" | "missing" | "primitive" | "wrong" | "invalid" | "unsupported"}
 */
export function throwsOutcome(expectedErrorConstructor, func) {
  if (typeof func !== "function") return "invalid";
  try {
    func();
  } catch (thrown) {
    const value = thrown;
    if (typeof thrown !== "object" || thrown === null) return "primitive";
    if (!(thrown instanceof Error)) return "unsupported";
    return value.constructor === expectedErrorConstructor ? "pass" : "wrong";
  }
  return "missing";
}
