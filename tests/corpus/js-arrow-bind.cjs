let receivers = 0;
let defaults = 0;
function receiver() {
  receivers++;
  return { value: 100 };
}
function nextDefault() {
  defaults++;
  return defaults;
}

class Example {
  value = 3;
  callback = ((increment) => this.value + increment).bind(this);
  make() {
    return (() => this.value).bind(receiver());
  }
  run() {
    const first = this.make();
    const alias = first;
    const second = this.make();
    console.log("identity", first === alias, first === second, this.callback === this.callback);
    console.log("lexical", this.callback(4), first(), second(), receivers);
    this.value = 8;
    console.log("live", this.callback(2), first(), second());
    console.log("metadata", JSON.stringify(first.name), first.length, JSON.stringify(this.callback.name), this.callback.length);
    console.log("alias", JSON.stringify(alias.name), alias.length);
  }
}
new Example().run();

function run() {
  const callback = ((value = nextDefault()) => value + 10).bind(receiver());
  console.log("deferred default", defaults, callback.length, JSON.stringify(callback.name));
  console.log("defaults", callback(), callback(undefined), callback(7), defaults);
  const options = ((options = {}) => options.message ?? "default").bind(null);
  console.log("options", options(), options({ message: "supplied" }), options.length);
  const pair = ((head, tail = "last") => head + ":" + tail).bind(undefined);
  console.log("pair", pair("first"), pair("x", "y"), pair.length);
  const direct = (head, tail = "last") => head + ":" + tail;
  console.log("direct", direct("first"), direct("x", "y"));
  const empty = (() => "empty").bind();
  console.log("empty", empty(), empty.length, JSON.stringify(empty.name));
  let calls = 0;
  const fire = (() => { calls++; }).bind(99);
  fire();
  fire();
  console.log("void", calls, fire.length);
  try {
    ((value) => value).bind((() => { throw new Error("receiver failed"); })());
  } catch (error) {
    console.log("receiver error", error.message);
  }
  const fail = (() => { throw new TypeError("callback failed"); }).bind(null);
  try {
    fail();
  } catch (error) {
    console.error("callback error", error instanceof TypeError, error.message);
  }
}
run();

async function runAsync() {
  const callback = (async (value = 0) => value + 1).bind(receiver());
  console.log("async", await callback(8), callback.length, JSON.stringify(callback.name));
}
runAsync();
