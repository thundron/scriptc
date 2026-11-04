class Base {
  static label = "base";
  static scale(value: number): number { return value * 2; }
  static run(value: number): number { return this.scale(value) + 1; }
  static describe(label: string = this.label): string { return this.name + ":" + label; }
  static rename(label: string): void { this.label = label; }
  static delayed(value: number): () => number { return () => this.run(value); }
  static generic<T>(value: T): T { console.log(this.run(2)); return value; }
}
class Derived extends Base {
  static label = "derived";
  static scale(value: number): number { return value * 3; }
}
console.log(Base.run(4), Derived.run(4));
console.log(Base.delayed(5)(), Derived.delayed(5)());
console.log(Base.generic('base'), Derived.generic('derived'));
console.log(Base.describe(), Derived.describe(), Derived.describe('custom'));
Base.rename('first'); Derived.rename('second');
console.log(Base.describe(), Derived.describe());
class Private {
  static #value = 7;
  static read(): number { return this.#value; }
}
console.log(Private.read());
