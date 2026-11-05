type Probe =
  | { op: "file"; path: string; digest: string }
  | { op: "entries"; path: string; files: string[] }
  | { op: "missing"; path: string };

class Tracker {
  private readonly probes = new Map<string, Probe>();
  record(probe: Probe): void {
    const previous = this.probes.get(probe.path);
    const changed = previous !== undefined && JSON.stringify(previous) !== JSON.stringify(probe);
    console.log("record", changed);
    if (previous !== undefined) console.log("previous", JSON.stringify(previous));
    this.probes.set(probe.path, probe);
  }
}

const tracker = new Tracker();
tracker.record({ op: "file", path: "a", digest: "one" });
tracker.record({ op: "file", path: "a", digest: "one" });
tracker.record({ op: "file", path: "a", digest: "two" });
tracker.record({ op: "missing", path: "a" });
tracker.record({ op: "entries", path: "a", files: ["first", "second"] });
tracker.record({ op: "entries", path: "a", files: [] });

const values = new Map<string, Probe>();
const files: string[] = ["before"];
values.set("list", { op: "entries", path: "b", files });
const value = values.get("list");
if (value !== undefined) {
  console.log("list", JSON.stringify(value, null, 2));
  files.push("after");
  console.log("identity", JSON.stringify(value));
}
const missing = values.get("absent");
if (missing !== undefined) console.log("unreachable", JSON.stringify(missing));
else console.log("missing");

const strings = new Map<string, string>();
strings.set("present", "hello");
console.log("optional string", JSON.stringify(strings.get("present")), JSON.stringify(strings.get("absent")) === undefined);
let lookups = 0;
function lookup(): Probe | undefined {
  lookups++;
  return values.get("list");
}
const found = lookup();
if (found !== undefined) console.log("once", JSON.stringify(found), lookups);

function shadow(JSON: { stringify: (value: Probe | undefined) => string }): void {
  const absent = values.get("absent");
  console.log(JSON.stringify(absent));
}
shadow({ stringify: (value) => value === undefined ? "shadow received undefined" : "shadow received value" });
