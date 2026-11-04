function check(map: any, set: any): void {
  console.log(JSON.stringify(Array.from(map.values())));
  console.log(JSON.stringify(Array.from(map.keys())));
  console.log(JSON.stringify(Array.from(map.entries())));
  const cursor = map.values();
  console.log(JSON.stringify(cursor.next()));
  map.delete("b");
  map.set("c", 3);
  console.log(JSON.stringify(cursor.next()), JSON.stringify(cursor.next()));
  map.set("d", 4);
  console.log(JSON.stringify(cursor.next()));
  map.forEach((value: any, key: any, owner: any) => {
    console.log(key, value, owner === map);
    if (key === "a") owner.set("e", 5);
  });
  console.log(JSON.stringify(Array.from(set.values())));
  console.log(JSON.stringify(Array.from(set.keys())));
  console.log(JSON.stringify(Array.from(set.entries())));
  const values = set.values();
  console.log(JSON.stringify(values.next()));
  set.clear();
  set.add(3);
  console.log(JSON.stringify(values.next()), JSON.stringify(values.next()));
}
check(new Map<unknown, unknown>([["a", 1], ["b", 2]]), new Set<unknown>([1, 2]));
