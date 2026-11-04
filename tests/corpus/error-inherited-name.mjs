class Failure extends Error {
  get name() { return "Failure"; }
}
const error = new Failure("bad");
console.log(error.name, error.toString(), Object.hasOwn(error, "name"));
const seen = [];
class NameThrows extends Error {
  /** @returns {string} */
  get name() { seen.push("name"); throw new Error("name getter"); }
  get message() { seen.push("message"); return "unused"; }
}
try { new NameThrows().toString(); } catch (error) { console.log(error.message); }
console.log(seen.join(","));

function readMessage(error) { return error.message; }
const renamed = new Error();
renamed.name = "Renamed";
console.log(renamed.name, readMessage(renamed) === "", Object.hasOwn(renamed, "message"));
