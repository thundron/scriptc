import { gather } from "./barrel.js";
import * as namespace from "./barrel.js";
console.log(gather("left", "right"));
console.log(gather("only"));
console.log(namespace.gather("namespace", "call"));
