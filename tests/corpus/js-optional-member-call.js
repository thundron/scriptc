function call(options) {
  return options?.render?.(4);
}
const host = { value: 3, render(n) { return this.value + n; } };
console.log(call(host), call({}), call(undefined), call(null));

function reference(key, options) {
  function Service() {}
  Object.setPrototypeOf(Service, { useSync(fn) { return fn(this.key); } });
  const init = (name, config) => {
    Service.key = name;
    Service.render = config?.render;
    return Service;
  };
  return arguments.length ? init(key, options) : init;
}
const service = reference("scene", host);
console.log(service.useSync(name => name.toUpperCase()));
console.log(service.render?.(5));
console.log(reference()("mesh", {}).useSync(name => name));
