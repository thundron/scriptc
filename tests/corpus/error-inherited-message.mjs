class Explained extends Error {
  detail = "computed";
  get message() { return this.detail; }
  toString() { return this.name + ": " + this.message; }
}
function read(error) { return error.message; }
const absent = new Explained();
const present = new Explained("own");
const empty = new Explained("");
console.log(absent.message, read(absent), absent.toString());
console.log(present.message, read(present), empty.message === "");
console.log(Object.hasOwn(absent, "message"), Object.hasOwn(present, "message"), Object.hasOwn(empty, "message"));
console.log(Object.getOwnPropertyDescriptor(absent, "message") === undefined);
console.log(Object.getOwnPropertyDescriptor(present, "message").enumerable);
function write(error, message) { error.message = message; }
try { write(absent, "no"); } catch (error) { console.log(error.name); }
write(present, "updated");
console.log(read(present));
const marker = Symbol("marker");
Object.assign(absent, { detail: "assigned" });
Object.defineProperty(absent, marker, { value: 42 });
console.log(read(absent), absent[marker]);
try { throw absent; } catch (error) {
  console.log(error === absent, error.message, error[marker]);
}
class DefaultRendering extends Error {
  get message() { return "from getter"; }
}
console.log(new DefaultRendering().toString());
class ThrowingMessage extends Error {
  /** @returns {string} */
  get message() { throw new Error("message getter"); }
}
try { new ThrowingMessage().toString(); } catch (error) { console.log(error.message); }
try { new ThrowingMessage().stack; } catch (error) { console.log(error.message); }
const plain = new Error();
write(plain, "added");
console.log(Object.hasOwn(plain, "message"), Object.getOwnPropertyDescriptor(plain, "message").enumerable);
