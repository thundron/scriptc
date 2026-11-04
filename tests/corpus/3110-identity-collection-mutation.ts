interface Key { id: number }
const keys: Key[] = [];
for (let i = 0; i < 90; i++) keys.push({ id: i });
const map = new Map<Key, number>([[keys[0]!, 0], [keys[1]!, 1], [keys[2]!, 2]]);
const seen: string[] = [];
map.forEach((value, key) => {
  seen.push(key.id + ":" + value);
  if (key === keys[0]) {
    map.delete(keys[1]!);
    map.set(keys[2]!, 20);
    for (let i = 3; i < keys.length; i++) map.set(keys[i]!, i);
  }
});
console.log(seen.length, seen[0], seen[1], seen[seen.length - 1], map.size);
const cleared: number[] = [];
map.forEach((value, key) => {
  cleared.push(value);
  if (key === keys[0]) {
    map.clear();
    map.set(keys[1]!, 11);
  }
});
console.log(cleared.join(","), map.size, map.get(keys[1]!));

const set = new Set<Key>([keys[0]!, keys[1]!, keys[2]!]);
const walked: number[] = [];
set.forEach((key) => {
  walked.push(key.id);
  if (key === keys[0]) {
    set.delete(keys[1]!);
    for (let i = 3; i < keys.length; i++) set.add(keys[i]!);
  }
});
console.log(walked.length, walked[0], walked[1], walked[walked.length - 1]);
try {
  set.forEach((key) => {
    if (key.id === 2) throw new Error("stop");
  });
} catch (error) {
  if (error instanceof Error) console.log(error.message);
}
for (let i = 0; i < keys.length; i++) set.delete(keys[i]!);
set.add(keys[0]!);
console.log(set.size, [...set][0] === keys[0]);

const events: string[] = [];
function key(): Key { events.push("key"); return keys[0]!; }
function value(): number { events.push("value"); return 5; }
function target(): Map<Key, number> { events.push("receiver"); return map; }
target().set(key(), value());
console.log(events.join(","), map.get(keys[0]!));
const snapshot = [...map.keys()];
map.clear();
console.log(snapshot.length, snapshot[1] === keys[0], map.size);
