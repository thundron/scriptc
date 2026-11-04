function defaults() { return { async: false, extensions: null }; }
let calls = 0;
function extensions() { calls++; return { renderers: {}, childTokens: {} }; }
class Renderer {
  defaults = defaults();
  constructor(...options) { this.use(...options); }
  use(...options) {
    const selected = this.defaults.extensions || extensions();
    options.forEach(option => { this.defaults = option; });
    console.log(Object.keys(selected.renderers).length);
    return this;
  }
}
const renderer = new Renderer();
console.log(renderer.defaults.async, renderer.defaults.extensions, calls);
renderer.use();
console.log(calls);
