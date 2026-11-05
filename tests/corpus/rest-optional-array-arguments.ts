// Unchecked array reads widen rest elements while the rest array stays present.
class Collector {
  first(...values: number[]): string {
    return values.map(value => value === undefined ? "missing" : String(value)).join(",");
  }

  later(prefix: string, ...values: number[]): string {
    return prefix + values.map(value => value === undefined ? "missing" : String(value)).join(",");
  }
}

const items: number[] = [7];
const collector = new Collector();
console.log(collector.first(items[3]));
console.log(collector.first());
console.log(collector.first(...items));
console.log(collector.later("values:", 1, items[3], 2));
console.log(collector.later("empty:"));

function collect(...values: number[]): string {
  return values.map(value => value === undefined ? "missing" : String(value)).join(",");
}
console.log(collect(1, items[3], 2));
console.log(collect());

class Base {
  describe(...values: number[]): string {
    return "base:" + values.map(value => value === undefined ? "missing" : String(value)).join(",");
  }
}
class Derived extends Base {
  describe(...values: number[]): string {
    return "derived:" + values.map(value => value === undefined ? "missing" : String(value)).join(",");
  }
}
function describe(receiver: Base): string {
  return receiver.describe(1, items[3], 2);
}
console.log(describe(new Base()));
console.log(describe(new Derived()));

interface Node { marked?: boolean }
class Gate {
  blocked(...nodes: Node[]): boolean {
    return nodes.some(node => node?.marked === true);
  }
}
const nodes: Node[] = [{ marked: true }];
const gate = new Gate();
console.log(gate.blocked(nodes[3]), gate.blocked(nodes[0]!), gate.blocked());
