const key = Symbol("key");
const value: { label: string; [key]: number } = { label: "record", [key]: 42 };
for (const ownKey of Reflect.ownKeys(value)) {
  console.log(String(ownKey), value[ownKey as keyof typeof value]);
}
