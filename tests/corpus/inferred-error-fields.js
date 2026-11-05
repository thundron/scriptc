function makeError(message, options) {
  const error = new Error(message, options);
  if (error.message === "") error.message = "fallback";
  error.name = "ExampleError";
  return error;
}
const error = makeError("", { cause: "reason" });
console.log(error.name, error.message, error.cause);
