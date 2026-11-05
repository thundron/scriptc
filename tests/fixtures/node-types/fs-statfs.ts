import { statfsSync, statfs, type StatsFs, type BigIntStatsFs, type StatFsOptions } from "node:fs";
import { statfs as promisedStatfs } from "node:fs/promises";
import { pathToFileURL } from "node:url";
async function main(): Promise<void> {
  const number: StatsFs = statfsSync(Buffer.from("."));
  const big: BigIntStatsFs = statfsSync(pathToFileURL(process.cwd()), { bigint: true });
  const { bsize, blocks } = big;
  console.log("sync", number.bsize > 0, bsize * blocks > 0n, typeof big.ffree);
  const saved = statfsSync;
  console.log("saved", saved(".").bsize === number.bsize, saved(".", { bigint: true }).type === big.type);
  const promised: StatsFs = await promisedStatfs(".");
  const promisedBig: BigIntStatsFs = await promisedStatfs(Buffer.from("."), { bigint: true });
  console.log("promise", promised.bsize === number.bsize, promisedBig.bsize === big.bsize);
  const options: StatFsOptions = { bigint: process.argv.length > 10 };
  const mixed: StatsFs | BigIntStatsFs = statfsSync(".", options);
  console.log("runtime option", typeof mixed["blocks"], typeof (await promisedStatfs(".", options)).bsize);
  options.bigint = true;
  console.log("mutable option", options.bigint, typeof statfsSync(".", options).bsize);
  await new Promise<void>((resolve, reject) => statfs(".", (err, stats) => {
    if (err) reject(err); else { console.log("callback", stats.blocks > 0, typeof stats.type); resolve(); }
  }));
  const callback = statfs;
  await new Promise<void>((resolve, reject) => callback(pathToFileURL(process.cwd()), { bigint: true }, (err, stats) => {
    if (err) reject(err); else { console.log("big callback", stats.blocks > 0n, stats.bsize === big.bsize); resolve(); }
  }));
}
main();
