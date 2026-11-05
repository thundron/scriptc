function unavailable(value) { throw value; }
function loadBackend(enabled) {
  if (enabled) return { open(path, symbols) { return symbols; } };
  return { open() { return unavailable(new Error('native backend')); } };
}
var backend = loadBackend(false);
var open = backend.open;
var other = backend['open'];
function getLibrary(value) { return open(value, { symbol: 'entry' }); }
class Library {
  load(value) { return other(value, { symbol: 'entry' }); }
}
try { getLibrary('library'); }
catch (error) { console.log(error.message); }
try { new Library().load('library'); }
catch (error) { console.log(error.message); }
backend = loadBackend(true);
open = backend.open;
console.log(getLibrary('library').symbol);
