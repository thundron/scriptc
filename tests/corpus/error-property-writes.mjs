function format(value) {
  const error = new Error(value);
  error.span = "context";
  error.stack = "custom stack";
  for (const key of ["span", "stack", "other"]) console.log(key, key in error);
  console.log(error.span, error.stack);
  const key = "extra";
  error[key] = 42;
  console.log(error[key]);
}
format("bad");
