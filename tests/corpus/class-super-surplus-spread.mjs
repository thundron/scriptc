class Base {
  constructor() { console.log("base"); }
}
class Forward extends Base {
  constructor() {
    super(...arguments);
    console.log("forward", arguments.length);
  }
}
new Forward(1, 2);
function values() {
  console.log("values");
  return [1, 2];
}
class Spread extends Base {
  constructor() {
    super(...values());
    console.log("spread");
  }
}
new Spread();
class Empty {}
class EmptyForward extends Empty {
  constructor() { super(...arguments); }
}
console.log(new EmptyForward("value") instanceof Empty);
function invalid() { return 1; }
class Invalid extends Base {
  constructor() { super(...invalid()); }
}
try { new Invalid(); } catch (error) { console.log(error.name); }
