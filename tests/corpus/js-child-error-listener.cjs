const { spawn } = require("node:child_process");
function listener(consume) { return error => { consume(error); }; }
const child = spawn("/scriptc-missing-command", [], { stdio: "ignore" });
child.on("error", listener(error => {
  console.log(error instanceof Error, error.name, error.code);
}));
