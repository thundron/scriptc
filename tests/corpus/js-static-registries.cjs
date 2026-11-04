// Bundled OpenTUI stores renderables by number without type arguments.
class Renderable {
  static next = 1;
  static byNumber = new Map();
  num;
  constructor() {
    this.num = Renderable.next++;
    Renderable.byNumber.set(this.num, this);
  }
  destroy() {
    Renderable.byNumber.delete(this.num);
  }
}

const first = new Renderable();
const second = new Renderable();
console.log(first.num, second.num, Renderable.byNumber.size);
console.log(Renderable.byNumber.get(first.num) === first);
first.destroy();
console.log(Renderable.byNumber.has(first.num), Renderable.byNumber.get(second.num) === second);
second.destroy();
console.log(Renderable.byNumber.size, Renderable.byNumber.get(123) === undefined);

class Services {
  registered = new Set();
  add(value) { this.registered.add(value); }
  remove(value) { return this.registered.delete(value); }
  has(value) { return this.registered.has(value); }
}
const services = new Services();
services.add(first);
services.add(first);
services.add(second);
console.log(services.registered.size, services.has(first), services.has(second));
console.log(services.remove(first), services.remove(first), services.has(second));
services.registered.clear();
console.log(services.registered.size);
