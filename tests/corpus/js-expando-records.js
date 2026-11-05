function parse(sequence = "") {
  const key = { name: sequence, ctrl: false };
  if (sequence === "up") {
    key.code = "[A";
    key.super = false;
  }
  if (sequence === "empty") {
    key.code = undefined;
  }
  const alias = key;
  key.code = sequence + "-saved";
  console.log(alias === key, JSON.stringify(alias));
  console.log(JSON.stringify(key), Object.keys(key).join(","));
}
parse("a");
parse("up");
parse("empty");
function indexed(name) {
  const key = { value: 1 };
  key[name] = 2;
  console.log(JSON.stringify(key));
}
indexed("extra");
indexed("value");
function remove(present) {
  const key = { value: present ? 1 : undefined };
  delete key.value;
  console.log(JSON.stringify(key), "value" in key);
}
remove(true);
remove(false);
function aliasWrites(present) {
  const value = { first: 1, second: present ? "two" : undefined, third: true };
  const alias = value;
  const nested = alias;
  nested.extra = "four";
  delete alias.second;
  delete alias.missing;
  value.second = "again";
  console.log(value === nested, JSON.stringify(nested), Object.keys(value).join(","));
  let order = "";
  function receiver() { order += "receiver;"; return nested; }
  function key() { order += "key;"; return "first"; }
  delete receiver()[key()];
  console.log(order, JSON.stringify(value));
}
aliasWrites(true);
