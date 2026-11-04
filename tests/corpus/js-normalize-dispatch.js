function normalized(value) { return value.normalize(); }
function explicit(value) { return value.normalize(undefined); }
function decomposed(value) { return value.normalize("NFD"); }
const object = { normalize(...args) { return `${this === object}:${args.length}:${args[0]}`; } };
console.log(normalized(object), explicit(object), decomposed(object));
class Vector {
  normalize(...args) { return `${this instanceof Vector}:${args.length}:${args[0]}`; }
}
const vector = new Vector();
console.log(normalized(vector), explicit(vector), decomposed(vector));
console.log(normalized("e\u0301"), explicit("e\u0301"), decomposed("é"));
class Holder {
  constructor(value) { this.value = value; }
}
const held = new Holder(vector);
console.log(normalized(held.value), explicit(held.value), decomposed(held.value));
