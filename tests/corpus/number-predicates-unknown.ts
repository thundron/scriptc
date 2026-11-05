let calls = 0;
function input(value: unknown): unknown { calls++; return value; }
function check(value: unknown): void {
  console.log(Number.isFinite(input(value)), Number.isNaN(input(value)), Number.isInteger(input(value)), Number.isSafeInteger(input(value)));
}
check(0); check(-0); check(1.25); check(NaN); check(Infinity); check(-Infinity);
check(9007199254740991); check(9007199254740992);
check("1"); check(null); check(undefined); check(true); check(new Uint16Array([1]));
check({ valueOf(): number { console.log("should not coerce"); return 1; } });
console.log(calls);
