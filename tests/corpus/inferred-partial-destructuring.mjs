function invoke(callback, value) { return callback(value); }
const first = ([head]) => head;
console.log(invoke(first, [1, 2, 3]), invoke(first, []));
console.log(invoke(([head = 4]) => head, []));
console.log(invoke(([, second]) => second, [1, 2, 3]));
console.log(invoke(([head, ...tail]) => head + ":" + tail.join(","), [1, 2, 3]));
