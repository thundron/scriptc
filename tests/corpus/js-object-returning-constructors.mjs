function Counter(start = 2) {
  let value = start;
  return {
    next() { return ++value; },
    current() { return value; },
  };
}

let calls = 0;
function initial() { calls++; return 10; }
const first = new Counter(initial());
const second = new Counter();
console.log(calls, first.current(), second.current());
console.log(first.next(), first.next(), second.next());
console.log(first === second);
function readFirst() { return first.current(); }
console.log('global', readFirst());

function Choice(flag = false) {
  if (flag) return { value: 3 };
  return { value: 9 };
}
console.log(new Choice(true).value, new Choice().value);
