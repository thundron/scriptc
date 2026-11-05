import { statfsSync, mkdtempSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { statfs } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

async function main(): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "scriptc-statfs-"));
  try {
    const file = join(root, "file");
    writeFileSync(file, "capacity");
    const number = statfsSync(root);
    console.log("number", typeof number.type, typeof number.bsize, typeof number.blocks, typeof number.bfree, typeof number.bavail, typeof number.files, typeof number.ffree);
    console.log("capacity", number.bsize > 0, number.blocks > 0, number.bfree >= 0, number.bavail >= 0, number.files >= 0, number.ffree >= 0);
    const big = statfsSync(Buffer.from(file), { bigint: true });
    console.log("bigint", typeof big.type, typeof big.bsize, typeof big.blocks, typeof big.bfree, typeof big.bavail, typeof big.files, typeof big.ffree);
    console.log("arithmetic", big.bsize * big.blocks > 0n, big.bfree >= 0n, big.bavail >= 0n, big.files >= 0n, big.ffree >= 0n, BigInt(number.type) === big.type, BigInt(number.bsize) === big.bsize);
    const stored = statfsSync;
    const { blocks, bsize } = stored(pathToFileURL(root), { bigint: true });
    console.log("captured", blocks > 0n, bsize === big.bsize);
    symlinkSync(root, join(root, "link"), "junction");
    console.log("link", statfsSync(join(root, "link")).type === number.type);
    const promised = await statfs(pathToFileURL(file));
    const storedPromise = statfs;
    const promisedBig = await storedPromise(Buffer.from(root), { bigint: true });
    console.log("promise", promised.bsize === number.bsize, promisedBig.type === big.type, promisedBig.blocks > 0n);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
main();
