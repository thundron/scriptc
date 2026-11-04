function write(view) {
  view.setUint16("1", 0x1234, true);
  view.setInt32(4, -123456, false);
  view.setFloat32(8, 1.5, true);
  view.setFloat64(12, -2.25, false);
  view.setBigInt64(20, "-7", true);
}
function read(view) {
  console.log(view.getUint16(1, true), view.getInt32(4), view.getFloat32(8, true), view.getFloat64(12), String(view.getBigInt64(20, true)));
  try { view.getUint32(31); } catch (error) { console.log(error.name, error.message); }
  try { view.setBigUint64(20, 1); } catch (error) { console.log(error.name, error.message); }
}
const view = new DataView(new ArrayBuffer(36), 2, 32);
write(view);
read(view);
const calls = [];
function order(view) {
  try {
    view.setUint32({ valueOf() { calls.push("offset"); return -1; } }, { valueOf() { calls.push("value"); return 2; } });
  } catch (error) { console.log(error.name, calls.join(",")); }
}
order(view);
