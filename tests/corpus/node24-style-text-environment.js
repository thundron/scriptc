import { styleText } from "node:util";
const originalForce = process.env.FORCE_COLOR;
const originalNoColor = process.env.NO_COLOR;
const originalDisable = process.env.NODE_DISABLE_COLORS;
delete process.env.FORCE_COLOR;
delete process.env.NO_COLOR;
delete process.env.NODE_DISABLE_COLORS;
for (const force of ["", "0", "1", "2", "3", "true", "false", "4", "01", "blue"]) {
  process.env.FORCE_COLOR = String(force);
  console.log("force " + force + " " + JSON.stringify(styleText(["bold", "red"], "x")));
  console.log("stderr " + force + " " + JSON.stringify(styleText("green", "x", {stream: process.stderr})));
  console.log("bypass " + force + " " + JSON.stringify(styleText("blue", "x", {validateStream: false})));
}
delete process.env.FORCE_COLOR;
for (const disabled of ["", "1"]) {
  process.env.NO_COLOR = String(disabled);
  console.log("no-color " + disabled + " " + JSON.stringify(styleText("red", "x")));
  console.log("explicit " + disabled + " " + JSON.stringify(styleText("red", "x", {validateStream: false})));
  delete process.env.NO_COLOR;
  process.env.NODE_DISABLE_COLORS = String(disabled);
  console.log("disabled " + disabled + " " + JSON.stringify(styleText("green", "x", {stream: process.stdout})));
  delete process.env.NODE_DISABLE_COLORS;
}
if (originalForce === undefined) delete process.env.FORCE_COLOR; else process.env.FORCE_COLOR = String(originalForce);
if (originalNoColor === undefined) delete process.env.NO_COLOR; else process.env.NO_COLOR = String(originalNoColor);
if (originalDisable === undefined) delete process.env.NODE_DISABLE_COLORS; else process.env.NODE_DISABLE_COLORS = String(originalDisable);
