// @dynamic
// @stderr
import { reportTypes, reportNativeTypes } from "node24-util-types-fixture";
reportTypes();
import { types } from "node:util";
reportNativeTypes((value: unknown): string => [types.isUint8Array(value), types.isDataView(value), types.isArrayBuffer(value), types.isMap(value),
  types.isSet(value), types.isWeakMap(value), types.isWeakSet(value), types.isRegExp(value), types.isNativeError(value), types.isPromise(value),
  types.isAsyncFunction(value), types.isGeneratorFunction(value), types.isGeneratorObject(value), types.isProxy(value)].join(","));
