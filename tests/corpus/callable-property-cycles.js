function create(seed) {
  const callable = function() { return seed; };
  callable.self = callable;
  callable.metadata = { seed, callable };
  Object.defineProperty(callable, "read", {
    get: function() { return callable.metadata.seed; }, configurable: true
  });
  return callable;
}
const live = create(7);
let total = 0;
for (let i = 0; i < 2000; i++) {
  const callable = create(i);
  total += callable.read;
  if (callable.self !== callable) throw new Error("self");
  if (callable.metadata.callable !== callable) throw new Error("nested identity");
}
console.log(total, live(), live.read, live.self === live);
