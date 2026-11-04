try {
  throw new TypeError("x");
} catch (error) {
  console.log(typeof error === "object", typeof error !== "object");
}

try {
  throw () => 1;
} catch (error) {
  console.log(typeof error === "object", typeof error !== "object");
}

try {
  throw 1;
} catch (error) {
  console.log(typeof error === "object", typeof error !== "object");
}

try {
  throw JSON.parse("null");
} catch (error) {
  console.log(typeof error === "object", typeof error !== "object");
}

try {
  throw Symbol("x");
} catch (error) {
  console.log(typeof error === "object", typeof error !== "object");
}

try {
  throw 1n;
} catch (error) {
  console.log(typeof error === "object", typeof error !== "object");
}
