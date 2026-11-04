// `1e999` as a type crosses the API as +Inf, which tsgo cannot JSON-marshal
// (upstream signature 03): the collection-side panic fence defers the
// SC0004 until f() is reached, reporting the declaration and call site.
type A = 1e999;
export function f(): A { throw new Error("x"); }
export const m = f();
