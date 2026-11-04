function show(left, right) {
  console.log(left & right, left | right, left ^ right, left << right, left >> right, ~left);
}
show(9, 2);
show("9", "2");
show(undefined, null);
show(-1, 35);
show(9n, 2n);
show(-9n, -2n);
function unsigned(left, right) { return left >>> right; }
console.log(unsigned(-1, 0), unsigned(4294967296, 32));
const order = [];
show({ valueOf() { order.push("left"); return 7; } }, { valueOf() { order.push("right"); return 1; } });
console.log(order.join(","));
try { show(1n, 2); } catch (error) { console.log(error.name, error.message); }
try { unsigned(1n, 1n); } catch (error) { console.log(error.name, error.message); }
try { show(Symbol("value"), 1); } catch (error) { console.log(error.name, error.message); }
