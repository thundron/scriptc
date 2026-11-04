export class Counter {
  static value = 10;
  static #private = 20;
  static nextPrivate(): number {
    return Counter.#private++;
  }
}
