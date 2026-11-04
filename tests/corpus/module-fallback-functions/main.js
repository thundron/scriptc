import { sleep, format, selected, replace } from "./platform.js";
class Renderer {
  async render() { console.log(await sleep(4), format("frame"), selected("frame")); }
}
const renderer = new Renderer();
await renderer.render();
replace();
await renderer.render();
