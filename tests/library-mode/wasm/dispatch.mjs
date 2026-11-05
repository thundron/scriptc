/** @returns {number} */
export function dispatch() {
  return consume(1, 2, 3);
}

function consume(...values) {
  const first = values.shift();
  values.push(4);
  const object = JSON.parse('{}');
  Object.defineProperties(object, { score: { value: 5, enumerable: true } });
  const add = (left, right) => left + right;
  return Number(first) + values.join("").length + Number(object.score) + Number(add.apply(null, [6, 7]));
}
