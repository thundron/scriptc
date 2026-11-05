const events = [];
function argument() { events.push("arg"); return 2; }
function receiver(value) { events.push("receiver"); return value; }
const present = {
  base: 40,
  get callback() {
    events.push("get");
    return function(value) { events.push("call"); return this.base + value; };
  }
};
function invoke(value) { return receiver(value).callback?.(argument()); }
console.log(invoke(present), events.join(","));
events.length = 0;
console.log(invoke({ callback: null }), events.join(","));
events.length = 0;
function key() { events.push("key"); return "callback"; }
function computed(value) { return receiver(value)[key()]?.(argument()); }
console.log(computed(present), events.join(","));
function optional(callback) { return callback?.(...[2, 3]); }
console.log(optional((a, b) => a + b), optional(undefined));
