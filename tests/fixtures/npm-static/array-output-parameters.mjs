class Item {
  constructor(value = 1) { this.value = value; }
}
class Collector {
  /** @param {Array<Item>} output */
  collect(output) { output.push(new Item(3)); }
  /** @param {Array<Item>} output
   * @return {Array<Item>} */
  append(output) { this.collect(output); return output; }
  run() {
    const output = [];
    this.collect(output);
    console.log('local', output.length, output[0].value);
    return output;
  }
}
const collector = new Collector();
const values = [];
collector.collect(values);
const alias = collector.append(values);
console.log('shared', values.length, alias === values, values[0].value);
console.log('nested', collector.run().length);
alias.push(new Item(7));
function readShared() { return alias.length + values[2].value; }
console.log('write-back', readShared());
/** @returns {Array<Item>} */
function seeded() { return [new Item(4)]; }
const typed = seeded();
collector.collect(typed);
console.log('typed-result', typed.length, typed[0].value, typed[1].value);
