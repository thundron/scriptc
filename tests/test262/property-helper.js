// Copyright (C) 2017 Ecma International. All rights reserved.
// This adaptation of Test262's propertyHelper.js is governed by the BSD license in vendor/LICENSE.

function propertyLabel(name, options) {
  return options && options.label || String(name);
}

function propertyEnumerable(obj, name) {
  if (!Object.hasOwn(obj, name)) return false;
  if (typeof name !== "string") return Object.getOwnPropertyDescriptor(obj, name).enumerable;
  return Object.keys(obj).includes(name);
}

function propertyWritable(obj, name) {
  const oldValue = obj[name];
  const hadValue = Object.hasOwn(obj, name);
  if (Array.isArray(obj) && name === "length") {
    try {
      obj[name] = 4294967295;
    } catch (error) {
      if (!(error instanceof TypeError)) throw new Test262Error("Expected TypeError, got " + error);
    }
    const succeeded = obj[name] === 4294967295;
    if (succeeded) obj[name] = oldValue;
    return succeeded;
  }
  const alternate = oldValue === "unlikelyValue";
  const newValue = alternate ? "unlikelyValue2" : "unlikelyValue";
  try {
    obj[name] = newValue;
  } catch (error) {
    if (!(error instanceof TypeError)) throw new Test262Error("Expected TypeError, got " + error);
  }
  const succeeded = alternate ? obj[name] === "unlikelyValue2" : obj[name] === "unlikelyValue";
  if (succeeded) {
    if (hadValue) obj[name] = oldValue;
    else delete obj[name];
  }
  return succeeded;
}

function propertyConfigurable(obj, name) {
  try {
    delete obj[name];
  } catch (error) {
    if (!(error instanceof TypeError)) throw new Test262Error("Expected TypeError, got " + error);
  }
  return !Object.hasOwn(obj, name);
}

function verifyProperty(obj, name, desc, options) {
  const label = propertyLabel(name, options);
  const original = Object.getOwnPropertyDescriptor(obj, name);
  if (desc === undefined) {
    assert(original === undefined, label + " descriptor should be undefined");
    return true;
  }
  assert(Object.hasOwn(obj, name), label + " should be an own property");
  assert(desc !== null, "The desc argument should be an object or undefined, null");
  assert(typeof desc === "object", "The desc argument should be an object or undefined, " + String(desc));
  for (const field of Object.keys(desc)) {
    assert(["value", "writable", "enumerable", "configurable", "get", "set"].includes(field), "Invalid descriptor field: " + field);
  }
  if (Object.hasOwn(desc, "value")) {
    assert.sameValue(desc.value, original.value, label + " descriptor value should be " + String(desc.value));
    assert.sameValue(desc.value, obj[name], label + " value should be " + String(desc.value));
  }
  if (Object.hasOwn(desc, "enumerable") && desc.enumerable !== undefined) {
    const message = label + " descriptor should " + (desc.enumerable ? "" : "not ") + "be enumerable";
    assert.sameValue(desc.enumerable, original.enumerable, message);
    assert.sameValue(desc.enumerable, propertyEnumerable(obj, name), message);
  }
  if (Object.hasOwn(desc, "writable") && desc.writable !== undefined) {
    const message = label + " descriptor should " + (desc.writable ? "" : "not ") + "be writable";
    assert.sameValue(desc.writable, original.writable, message);
    assert.sameValue(desc.writable, propertyWritable(obj, name), message);
  }
  if (Object.hasOwn(desc, "configurable") && desc.configurable !== undefined) {
    const message = label + " descriptor should " + (desc.configurable ? "" : "not ") + "be configurable";
    assert.sameValue(desc.configurable, original.configurable, message);
    assert.sameValue(desc.configurable, propertyConfigurable(obj, name), message);
  }
  if (options && options.restore) Object.defineProperty(obj, name, original);
  return true;
}
