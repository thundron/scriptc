/** @param {number} [first] @param {number} [second] */
export function inspect(first, second) {
  console.log(first, second);
}

/** @param {number} [first] @param {number} [second] */
export const choose = function (first, second) {
  return second === undefined ? first : second;
};
