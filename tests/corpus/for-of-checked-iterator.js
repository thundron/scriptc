// Object-method parameters keep the iterable behind a checked boundary.
const consume = {
  walk(source, mode) {
    outer: for (const value of source) {
      console.log("value", value);
      if (mode === "break") break;
      if (mode === "return") return "returned";
      if (mode === "throw") throw new Error("body");
      if (mode === "continue") continue outer;
      if (mode === "live" && value === 1) source.push(2);
    }
    return "finished";
  }
};
function iterable(closeMode, stepMode) {
  return {
    [Symbol.iterator]() {
      console.log("open");
      let index = 0;
      return {
        get next() {
          console.log("get next");
          return function () {
            console.log("next", index, arguments.length);
            if (stepMode === "next") throw new Error("next");
            const current = index++;
            return {
              get done() {
                console.log("done", current);
                if (stepMode === "done") throw new Error("done");
                return current === 2;
              },
              get value() {
                console.log("read", current);
                if (stepMode === "value") throw new Error("value");
                return current;
              }
            };
          };
        },
        get return() {
          console.log("get return");
          if (closeMode === "get") throw new Error("close getter");
          return function () {
            console.log("close", arguments.length);
            if (closeMode === "throw") throw new Error("close");
            if (closeMode === "primitive") return 42;
            return {};
          };
        }
      };
    }
  };
}
for (const mode of ["normal", "continue", "break", "return", "throw"]) {
  console.log(mode);
  try { console.log(consume.walk(iterable("ok", "ok"), mode)); }
  catch (error) { console.log(error.name, error.message); }
}
for (const closeMode of ["get", "throw", "primitive"]) {
  for (const mode of ["break", "throw"]) {
    console.log(closeMode, mode);
    try { consume.walk(iterable(closeMode, "ok"), mode); }
    catch (error) { console.log(error.name, error instanceof TypeError ? "invalid return" : error.message); }
  }
}
for (const stepMode of ["next", "done", "value"]) {
  try { consume.walk(iterable("ok", stepMode), "normal"); }
  catch (error) { console.log(error.message); }
}
console.log(consume.walk([1], "live"));
console.log(consume.walk("a😀b", "normal"));
class Cursor {
  index = 0;
  next() { return { done: this.index === 2, value: this.index++ }; }
  return() { console.log("class close"); return {}; }
}
const prototype = { [Symbol.iterator]() { return new Cursor(); } };
console.log(consume.walk(Object.create(prototype), "break"));
console.log(consume.walk(Object.create(prototype), "normal"));

const nested = {
  walk(source) {
    outer: for (const n of [0, 1]) {
      for (const value of source) {
        console.log("nested", n, value);
        if (n === 0) continue outer;
        break outer;
      }
    }
  },
  destructure(source) {
    for (const { missing: { field } } of source) console.log(field);
  }
};
nested.walk(iterable("ok", "ok"));
try { nested.destructure(iterable("ok", "ok")); }
catch (error) { console.log("binding", error.name); }
