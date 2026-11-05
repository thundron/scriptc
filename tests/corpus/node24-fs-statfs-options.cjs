const fs = require("node:fs");
const fsp = require("node:fs/promises");
async function main() {
  for (const options of [undefined, {}, false, 42, "abc", [], { bigint: false }, { bigint: 1 }, { bigint: "yes" }, { bigint: true }]) {
    const sync = fs.statfsSync(".", options);
    const promised = await fsp.statfs(".", options);
    await new Promise((resolve, reject) => fs.statfs(".", options, (err, stats) => {
      if (err) reject(err); else {
        console.log("option", typeof sync.bsize, typeof promised.bsize, typeof stats.bsize, sync.bsize === stats.bsize);
        resolve(undefined);
      }
    }));
  }
  let reads = 0;
  const options = { get bigint() { reads++; return reads % 2 === 1; } };
  console.log("getter sync", typeof fs.statfsSync(".", options).bsize, reads);
  console.log("getter promise", typeof (await fsp.statfs(".", options)).bsize, reads);
  await new Promise((resolve, reject) => fs.statfs(".", options, (err, stats) => {
    if (err) reject(err); else { console.log("getter callback", typeof stats.bsize, reads); resolve(undefined); }
  }));
  const inherited = Object.create({ bigint: true });
  console.log("inherited", typeof fs.statfsSync(".", inherited).bsize);
  const proxy = new Proxy({ bigint: true }, { get(target, key) { console.log("proxy", key); return target[key]; } });
  console.log("proxy result", typeof fs.statfsSync(".", proxy).bsize);
  const stats = fs.statfsSync(".");
  console.log("keys", Object.keys(stats).join(","));
  const big = fs.statfsSync(".", { bigint: true });
  console.log("big keys", Object.keys(big).join(","));
  console.log("writable", Object.getOwnPropertyDescriptor(stats, "blocks").writable, Object.getOwnPropertyDescriptor(stats, "blocks").enumerable, Object.getOwnPropertyDescriptor(stats, "blocks").configurable);
  stats.blocks = 12;
  console.log("mutation", stats.blocks);
}
main();
