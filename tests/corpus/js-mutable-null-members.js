function node(value) { return { value, next: null }; }
function identity(value) { return value; }
const first = node(1), second = node(2);
first.next = second;
console.log(identity(first.next).value);
second.next = first;
console.log(identity(first.next.next) === first);
const scratch = { center: null, elements: [] };
scratch.center = { x: 3 };
scratch.elements = [4, 5];
console.log(identity(scratch.center).x, identity(scratch.elements)[1]);
