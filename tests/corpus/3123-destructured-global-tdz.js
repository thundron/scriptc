function before() {
  try {
    return arrow.name;
  } catch (error) {
    return error.name;
  }
}

console.log(before());
const [arrow = () => {}] = [];
let [other = function () {}] = [];
const { nested = () => {} } = {};
var [plain = () => {}] = [];
console.log(arrow.name, other.name, nested.name, plain.name);
export {};
