interface State {
  label: string;
  cache?: Map<string, State>;
}

function cycle(label: string): string {
  const state: State = { label };
  const cache = new Map<string, State>();
  state.cache = cache;
  cache.set("self", state);
  return state.cache.get("self")!.label;
}

for (let i = 0; i < 200; i++) cycle("temporary");
console.log(cycle("live"));

class Config {
  sources?: Map<string, string>;
  flags?: Set<string>;
  constructor(enabled: boolean) {
    if (enabled) {
      this.sources = new Map<string, string>([["entry", "text"]]);
      this.flags = new Set<string>(["debug"]);
    }
  }
  read(): string {
    return this.sources?.get("entry") ?? "none";
  }
  clear(): void {
    this.sources = undefined;
    this.flags = undefined;
  }
}

const active = new Config(true);
const empty = new Config(false);
console.log(active.read(), empty.read(), active.flags?.has("debug"));
const saved = active.sources;
active.clear();
console.log(active.read(), saved?.get("entry"), active.flags);

function captured(): () => string {
  let cache: Map<string, string> | undefined = new Map<string, string>([["key", "value"]]);
  return () => {
    const result = cache?.get("key") ?? "cleared";
    cache = undefined;
    return result;
  };
}
const read = captured();
console.log(read(), read());

function* maps(): Generator<Map<string, number>, void, unknown> {
  yield new Map<string, number>([["value", 3]]);
  yield new Map<string, number>([["value", 9]]);
}
const iterator = maps();
const first = iterator.next();
const second = iterator.next();
const last = iterator.next();
console.log(first.done, first.value?.get("value"));
console.log(second.done, second.value?.get("value"));
console.log(last.done, last.value);

interface Options {
  values?: Map<string, number>;
}
function readOptions(options: Options): number {
  const selected = options.values ?? new Map<string, number>([["fallback", 11]]);
  return selected.get("fallback") ?? 0;
}
const supplied = new Map<string, number>([["fallback", 23]]);
const merged: Options = { values: supplied };
console.log(readOptions({}), readOptions(merged));
console.log(merged.values === supplied);
supplied.set("fallback", 42);
console.log(readOptions(merged));

function maybe(mode: number): ReadonlyMap<string, number> | null {
  return mode ? supplied : null;
}
for (let mode = 0; mode < 2; mode++) {
  const candidate = maybe(mode);
  console.log(candidate !== null, candidate?.get("fallback"));
  if (candidate !== null) {
    let total = 0;
    for (const value of candidate.values()) total += value;
    console.log(total);
  }
}
