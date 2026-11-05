const proto = {
  toString() { return `value:${this.label}`; }
};
const value = Object.create(proto);
value.label = "first";
const child = Object.create(value);
child.label = "second";
console.log(value.toString(), child.toString(), String(child));
Object.defineProperty(proto, "toString", {
  configurable: true,
  get() {
    const label = this.label;
    return function() { return `${label}/${this.label}`; };
  }
});
console.log(value.toString(), child.toString());
const shadow = Object.create(value);
Object.defineProperty(shadow, "toString", { value: undefined });
try { shadow.toString(); } catch (error) { console.log(error.name, error.message); }
Object.defineProperty(proto, "toString", {
  configurable: true,
  get() { throw new Error("formatter getter"); }
});
try { child.toString(); } catch (error) { console.log(error.name, error.message); }
const own = Object.create(null);
own.label = "own";
own.toString = function() { return this.label; };
console.log(own.toString());
