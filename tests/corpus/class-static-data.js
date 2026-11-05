// @ts-nocheck
class Defaults { constructor(value = Defaults.value) { this.value = value; } }
class Child extends Defaults {}
const Alias = Defaults;
console.log(Defaults.value, Child.value, Defaults.hasOwnProperty('value'));
let effects = 0;
function initial() { effects++; return 'first'; }
Defaults.value = initial();
console.log(effects, new Defaults().value, Child.value, Child.hasOwnProperty('value'));
Alias.value = 'second';
console.log(Defaults.value, new Child().value);
Child.value = 'child';
Defaults.value = 'third';
console.log(Defaults.value, Child.value, Child.hasOwnProperty('value'));
Child.value = undefined;
console.log(Child.value, Defaults.value, Child.hasOwnProperty('value'));
Defaults.options = { scale: 2 };
console.log(Child.options.scale);
Child.options.scale = 3;
console.log(Defaults.options.scale);
