console.log(String(value), typeof value);
var value = 3;
console.log(value);
function local() {
  console.log(String(localValue));
  var localValue = 8;
  console.log(localValue);
  var self = self || { count: 2 };
  console.log(self.count);
}
local();
let later;
console.log(String(later));
later = 4;
console.log(later);
