import { inspect, choose } from "./functions.js";

class Box<T> {
  value: T;
  constructor(value: T) { this.value = value; }
  get current(): T { return this.value; }
  replace(value: T): void { this.value = value; }
}
interface BoxView<T> extends Box<T> {}
interface DeepBox<T> extends BoxView<T> {}

const direct = new Box(inspect);
direct.value(1, 2);
const saved = direct.current;
saved(3);
const view: DeepBox<typeof inspect> = direct;
const fromView = view.current;
fromView(4, 5);
view.replace(inspect);
view.value();

const chooser: DeepBox<typeof choose> = new Box(choose);
const chooseFromView = chooser.current;
console.log(chooseFromView(7), chooser.value(8, 9));
console.log(chooseFromView(undefined), chooseFromView());
