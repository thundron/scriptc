import { Counter } from "./counter.ts";

console.log(Counter.value++, ++Counter.value, Counter.value);
console.log(Counter.value--, --Counter.value, Counter.value);
Counter.value++;
--Counter.value;
console.log(Counter.value, Counter.nextPrivate(), Counter.nextPrivate());

const Alias = Counter;
console.log(Alias.value++, Counter.value);
const Local = class {
  static count = 3;
};
console.log(--Local.count, Local.count--, Local.count);

class Independent extends Counter {
  static override value = 100;
}
console.log(Independent.value++, Independent.value, Counter.value);
