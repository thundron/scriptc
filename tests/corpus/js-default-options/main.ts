import { enabled, enabledAsync, run } from "./index.js";

console.log("imported", enabled(), enabled(undefined), enabled({ enabled: true }), enabled({ extra: 2 }));
console.log("async", await enabledAsync(), await enabledAsync(undefined), await enabledAsync({ enabled: true }));
run();
