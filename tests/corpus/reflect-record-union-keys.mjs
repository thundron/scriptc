/** @param {{ count: number, label: string }} record */
function read(record) {
  for (const key of Reflect.ownKeys(record)) console.log(String(key), record[key]);
}
read({ count: 7, label: "record" });
