class First { value = 1; }
class Second { value = 2; }
const fallback = new First();
class State {
  previous = undefined;
  next(value) {
    const previous = this.previous === undefined ? fallback : this.previous;
    this.previous = value;
    return previous;
  }
}
const state = new State();
const next = new Second();
console.log(state.next(next) === fallback);
console.log(state.next(fallback) === next);
console.log(state.next(next).value);
