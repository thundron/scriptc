declare function nativeU64(value: bigint): bigint;
declare function nativeI64(value: bigint): bigint;
declare function nativePointer(value: bigint): bigint;
declare function callbackU64(callback: (value: bigint) => bigint, value: bigint): bigint;
declare function callbackI64(callback: (value: bigint) => bigint, value: bigint): bigint;
declare function callbackPointer(callback: (value: bigint) => bigint, value: bigint): bigint;
declare function pointerCheck(value: bigint): boolean;
declare function pointerNew(): bigint;
declare function wideMix(a: bigint, b: number, c: bigint, d: number, e: bigint, f: number, g: bigint, h: number, i: bigint, j: number, k: bigint, l: number, m: bigint, n: number): bigint;
declare function wideStart(callback: (value: bigint) => bigint): void;
declare function wideFire(value: bigint): bigint;
declare function wideStop(callback: (value: bigint) => bigint): void;

const values: bigint[] = [0n, 1n, -1n, 9007199254740993n, 9223372036854775807n, 9223372036854775808n, -9223372036854775808n, 18446744073709551615n, 18446744073709551616n, (1n << 100n) + 123n, -(1n << 100n) - 123n];
for (const value of values) console.log(nativeU64(value), nativeI64(value));
console.log(nativePointer(0n) === 0n, pointerCheck(nativePointer(pointerNew())));
console.log(callbackU64(value => value + 1n, 18446744073709551615n));
console.log(callbackI64(value => { console.log('signed', value); return value - 1n; }, -9223372036854775808n));
console.log(pointerCheck(callbackPointer(value => value, pointerNew())));
console.log(wideMix(9007199254740993n, 1.5, 2n, 2.5, 3n, 3.5, 4n, 4.5, 5n, 5.5, 6n, 6.5, 7n, 7.5));
try { callbackU64(() => { throw new Error('wide callback'); }, 1n); }
catch (error) { if (error instanceof Error) console.log(error.message); else throw error; }
const callback = (value: bigint): bigint => value + 9007199254740993n;
wideStart(callback);
console.log(wideFire(42n));
wideStop(callback);
