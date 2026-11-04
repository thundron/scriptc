class Base { copy(value = 1) { return value; } }
class Child extends Base { copy(value) { console.log("child", value); return value; } }
const child = new Child();
console.log(child.copy(2), new Base().copy());
function visit(value) { return value.copy(3); }
console.log(visit(child));
