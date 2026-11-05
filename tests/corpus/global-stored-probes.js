before();
try { probe(); } catch (error) { console.log(error.name, error.message); }
var scope = globalThis;
console.log(typeof scope, scope === globalThis, scope === global);
console.log(scope.globalThis === scope, scope.global === scope);
console.log(scope.NaN !== scope.NaN, scope.Infinity === Infinity, scope.undefined === undefined);
console.log(probe(), scope.Worker, scope.close);
function probe() { return typeof scope.postMessage; }
function before() { console.log(typeof scope, scope?.Bun); }
function local() {
  beforeLocal();
  var host = globalThis;
  const copy = host;
  console.log(copy === host, copy.Bun, host.Deno);
  host = { postMessage: () => "local" };
  console.log(host.postMessage(), copy.postMessage);
  function beforeLocal() { console.log(typeof host, host?.Bun); }
}
local();
scope = { postMessage: () => "replaced" };
console.log(probe(), scope.postMessage());
function shadowed(globalThis) {
  var host = globalThis;
  return host.Bun;
}
console.log(shadowed({ Bun: "shadow" }));
try { readLexical(); } catch (error) { console.log(error.name); }
let lexical = globalThis;
console.log(readLexical());
function readLexical() { return typeof lexical.Bun; }
