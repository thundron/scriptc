import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "scriptc-readonly-rm-"));
try {
  const file = join(root, "readonly.txt");
  writeFileSync(file, "keep until removed");
  chmodSync(file, 0o400);
  rmSync(file);
  console.log(existsSync(file));
  const nested = join(root, "tree", "nested");
  mkdirSync(nested, { recursive: true });
  writeFileSync(join(nested, "payload"), "read-only payload");
  chmodSync(join(nested, "payload"), 0o400);
  rmSync(join(root, "tree"), { recursive: true, force: true });
  console.log(existsSync(join(root, "tree")));
} finally { rmSync(root, { recursive: true, force: true }); }
