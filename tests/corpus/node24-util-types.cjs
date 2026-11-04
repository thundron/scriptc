const { types } = require("node:util");
const direct = require("util/types");
const { isMap, isUint16Array } = require("node:util/types");
console.log("cjs", types.isMap(new Map()), direct.isMap(new Map()), isMap(new Map()), isUint16Array(new Uint16Array(1)));
console.log("identity", types.isMap === direct.isMap, isMap === direct.isMap);
const load = process.getBuiltinModule;
console.log("module", load("util/types").isTypedArray(Buffer.alloc(0)));
