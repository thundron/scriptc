import { spawnSync } from "node:child_process";

if (process.argv[2] === "echo") {
  const args = process.argv;
  console.log(args === process.argv);
  console.log(JSON.stringify(args.slice(3)));
  args.push("追加");
  console.log(process.argv[process.argv.length - 1]);
} else {
  const argumentsToEcho = ["", "héllo", "中文", "🌍", "a b", 'double"quote', "end\\", 'slashes\\\\"quote', "&;$(hello)`test'", "line\nbreak", "tab\targ"];
  const result = spawnSync(process.execPath, [process.argv[1]!, "echo", ...argumentsToEcho], { encoding: "utf8" });
  console.log(result.status, result.stderr === "");
  process.stdout.write(result.stdout);
}
