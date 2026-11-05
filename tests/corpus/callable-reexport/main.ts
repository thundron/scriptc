import * as exported from "./barrel.js";
import { identity, returned } from "./barrel.js";
console.log(exported.identity("hello"));
console.log(identity(42));
console.log(exported.returned("namespace"));
console.log(returned("named"));
console.log(exported.variadic("rest", "export", "works"));
console.log(exported.withDefault((value: any) => value.value));
console.log(exported.withDefault((value: any) => value.value, undefined));
