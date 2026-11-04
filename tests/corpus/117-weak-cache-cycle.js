'use strict';
function build() {
  const cache = new WeakMap();
  const value = { read: () => cache };
  const key = {};
  cache.set(key, value);
  console.log(cache.get(key) === value);
}
build();
