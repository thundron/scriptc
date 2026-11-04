import { calculate } from "./helper.ts";

function report(): void {
  const value = calculate(3);
  console.log("result", value);
}

report();
