class Config { static create(value = 0) { return "config"; } }
const modes = Object.fromEntries([["auto", 0], ["manual", 1]]);
var layout = { Config: Config, modes: modes, limit: 18446744073709551615n };
var defaultLayout = layout;
var secondAlias = defaultLayout;
function mutate(value) { value.limit = 1n; }
mutate(defaultLayout);
console.log(defaultLayout === layout, secondAlias === layout, String(layout.limit));
console.log(defaultLayout.modes.auto, secondAlias.Config.create());
let evaluations = 0;
function current() { evaluations++; return defaultLayout; }
console.log(current().Config.create(), evaluations);
function fail() { console.log("receiver"); throw new Error("stop"); return defaultLayout; }
function argument() { console.log("argument"); return 1; }
try { fail().Config.create(argument()); } catch (error) { console.log(error.message); }
