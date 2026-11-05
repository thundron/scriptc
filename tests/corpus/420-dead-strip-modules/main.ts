// Dead-strip across modules: only what the entry reaches is compiled.
// The unused exports in lib.ts hold constructs the static compiler
// rejects — the build succeeds anyway, and the harness dead-strip test
// greps the emitted LLVM to pin that they leave no trace.
import "./side.ts";
import { Gadget, double, pick, used } from "./lib.ts";

console.log(used(5));
console.log(pick(double, 21));

const g = new Gadget();
console.log(g.tag, g.usedMethod());
g.tag = "relabeled";
console.log(g.tag, g.usedMethod());
