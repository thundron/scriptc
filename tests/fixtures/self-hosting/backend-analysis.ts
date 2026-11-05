import { readFileSync } from "node:fs";
import { deserializeModule, serializeModule } from "../../../packages/compiler/src/ir/serialize.js";
import { validateModule } from "../../../packages/compiler/src/ir/validate.js";
import { scalarizeNumericRecords } from "../../../packages/compiler/src/ir/scalar-records.js";
import { findConstantNumericTables } from "../../../packages/compiler/src/ir/constant-tables.js";
import { matchIntegerBytesForLoop } from "../../../packages/compiler/src/ir/integer-loops.js";
import { everyStmtList } from "../../../packages/compiler/src/ir/traverse.js";
import { computeMayThrow } from "../../../packages/compiler/src/backend/may-throw.js";
import { computeTraced } from "../../../packages/compiler/src/backend/cycle-analysis.js";

try {
  const mod = deserializeModule(readFileSync(process.argv[2]!, "utf8"));
  if (process.argv[3] === "optimize") {
    const before = validateModule(mod);
    if (before.length > 0) throw new Error(JSON.stringify(before));
    const original = serializeModule(mod);
    const optimized = scalarizeNumericRecords(mod);
    if (serializeModule(mod) !== original) throw new Error("optimizer mutated its input");
    const after = validateModule(optimized);
    if (after.length > 0) throw new Error(JSON.stringify(after));
    console.log(serializeModule(optimized));
  } else {
    // Analysis deliberately accepts structural IR too: e.g. link/unwind
    // decisions can be inspected without constructing executable FFI calls.
    const may = computeMayThrow(mod);
    const traced = computeTraced(mod);
    const tables: { id: string; symbol: string; values: string[] }[] = [];
    for (const [id, table] of findConstantNumericTables(mod)) {
      tables.push({ id, symbol: table.symbol, values: table.values.map((value) => Object.is(value, -0) ? "-0" : String(value)) });
    }
    const loops: { fn: string; localId: string; receiver: string }[] = [];
    for (const fn of mod.functions) {
      const locals = new Map(fn.locals.map((local) => [local.id, local]));
      everyStmtList(fn.body, { expr: () => true, stmt: (stmt) => {
        if (stmt.kind === "for") {
          const loop = matchIntegerBytesForLoop(stmt, locals);
          if (loop && loop.limitReceiver.kind === "varRef") {
            loops.push({ fn: fn.name, localId: loop.localId, receiver: loop.limitReceiver.localId });
          }
        }
        return true;
      } });
    }
    console.log(JSON.stringify({
      mayThrow: [...may.fns], indirect: may.indirect,
      tracedShapes: [...traced.shapes], tracedUnions: [...traced.unions], tables, loops,
    }));
  }
} catch (error) {
  if (error instanceof Error) console.log(error.name + ": " + error.message);
  else console.log("unexpected thrown value");
  process.exitCode = 1;
}
