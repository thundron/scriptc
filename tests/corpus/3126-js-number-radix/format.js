export function format(values, radix) {
  let result = "";
  for (let i = 0; i < values.length; i++) {
    if (i > 0) result += ",";
    result += values[i].toString(radix).padStart(2, "0");
  }
  return result;
}

export function missing(values) {
  try {
    return values[values.length].toString(16);
  } catch (error) {
    return error instanceof TypeError;
  }
}
