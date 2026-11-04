import * as core from "./core.js";
import * as exported from "./barrel.js";
import { prototype } from "./barrel.js";
import { read } from "./consumer.js";
console.log(prototype === core.prototype, exported.prototype === prototype);
prototype.value = "changed";
console.log(core.prototype.describe());
read();
