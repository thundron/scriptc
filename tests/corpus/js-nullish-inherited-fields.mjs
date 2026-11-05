class Value {
  constructor() { this.id = 7; }
}

class Base {
  /** @param {Record<string, Value>} values */
  load(values) { this.value = values.missing || null; }
}

class Derived extends Base {
  constructor() {
    super();
    /** @type {?Value} */
    this.value = null;
  }
}

const base = new Base();
console.log('initial', base.value === undefined);
base.load({});
console.log('missing', base.value === null);
const value = new Value();
base.load({ missing: value });
console.log('present', base.value === value);
const derived = new Derived();
console.log('derived', derived.value === null);
derived.load({ missing: value });
console.log('identity', derived.value === value);
derived.load({});
console.log('reset', derived.value === null);

class Optional {
  /** @param {Value} [value] */
  constructor(value) {
    /** @type {Value} */
    this.value = value;
  }
}
console.log('omitted', new Optional().value === undefined);
console.log('supplied', new Optional(value).value === value);
