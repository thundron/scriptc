class Renderer {
  pending = null;
  setPending(transition) { this.pending = transition; }
  resize(width) {
    const pending = this.pending;
    const height = pending?.sourceHeight ?? 4;
    let clearStart = null;
    if (width < 4 && height > 0) clearStart = 9;
    if (pending !== null) clearStart = clearStart === null ? pending.sourceTopLine : Math.min(clearStart, pending.sourceTopLine);
    console.log(clearStart, height);
  }
}
const renderer = new Renderer();
renderer.resize(5);
renderer.setPending({ sourceTopLine: 3, sourceHeight: 5 });
renderer.resize(5);
renderer.resize(2);
renderer.setPending(null);
renderer.resize(3);
