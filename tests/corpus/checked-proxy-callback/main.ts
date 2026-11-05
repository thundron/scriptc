import { makeTarget } from "./operations.mjs";
interface RequestValue { readonly kind: string; readonly value: number; }
function invoke(callback: any, value: any): any { return callback(value); }
const target: any = makeTarget();
const plain = new Proxy(target, {});
console.log(invoke((request: RequestValue) => request.kind + ":" + request.value * 2, plain));
const reads: string[] = [];
const trapped = new Proxy(target, { get(object: any, key: string): any {
  reads.push(key);
  return key === "value" ? 42 : object[key];
} });
console.log(invoke((request: RequestValue) => request.kind + ":" + request.value, trapped));
console.log(reads.join(","));
