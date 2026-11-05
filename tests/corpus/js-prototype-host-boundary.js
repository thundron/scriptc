class ResourceLoader {
  load() { return fetch("https://example.com"); }
}
ResourceLoader.prototype.load = function () { return "host supplied"; };
console.log(new ResourceLoader().load());
