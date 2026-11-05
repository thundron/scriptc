class Base {
  constructor(value = 2) { this.value = value; }
  scale(n) { return this.value * n; }
}
class Child extends Base {}
class Own extends Base { scale(n) { return this.value + n; } }
const b = new Base(), c = new Child(), o = new Own();
const original = Base.prototype.scale;
function presence(value, key) {
  console.log(key in value, Object.hasOwn(value, key), Object.prototype.propertyIsEnumerable.call(value, key));
}
presence(b, 'scale');
console.log(b.scale(3), c.scale(3), o.scale(3), c.scale === original);
Base.prototype.scale = function(n) { return this.value * n + 1; };
console.log(b.scale(3), c.scale(3), o.scale(3));
Child.prototype.scale = undefined;
console.log(typeof c.scale, typeof b.scale, typeof o.scale);
try { c.scale(3); } catch (error) { console.log(error.name); }
Child.prototype.scale = function(n) { return this.value + n + 10; };
console.log(c.scale(3), b.scale(3), o.scale(3));
Base.prototype.scale = original;
class MessageError extends Error {
  toString() { return this.message; }
}
const error = new MessageError('native error override');
const errorMethod = MessageError.prototype.toString;
console.log(error.toString(), errorMethod.call(error));
// @ts-expect-error JavaScript permits deleting a prototype method.
delete Base.prototype.scale;
presence(b, 'scale');
console.log(typeof b.scale, typeof c.scale);
try { throughBase(b); } catch (error) { console.log(error.name); }
Base.prototype.scale = original;
console.log(b.scale(3), c.scale(3));
function throughBase(value) { return value.scale(4); }
console.log(throughBase(b), throughBase(c), throughBase(o));
function replace() { Base.prototype.scale = function(n) { return n + 100; }; return 5; }
console.log(b.scale(replace()), b.scale(5));
const key = 'scale';
console.log(c[key](2), o[key](2));
let reads = 0;
function receiver() { reads++; return c; }
console.log(receiver()[key](3), reads);
const computed = c[key];
console.log(computed.call(c, 1));
c[key] = function(n) { return this.value + n + 20; };
presence(c, key);
console.log(c.scale(1), throughBase(c));
// @ts-expect-error JavaScript permits deleting a method override.
delete c[key];
presence(c, key);
console.log(c.scale(1));
// @ts-expect-error JavaScript permits deleting a prototype method.
delete Child.prototype.scale;
console.log(c.scale(2), b.scale(2));
class Forward extends Base { scale(n) { return super.scale(n) + 10; } }
const f = new Forward();
console.log(f.scale(2));
Base.prototype.scale = original;
console.log(f.scale(2));
Base.prototype.scale = undefined;
try { f.scale(2); } catch (error) { console.log(error.name); }
Base.prototype.scale = original;
