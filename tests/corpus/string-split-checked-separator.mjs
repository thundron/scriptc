function split(value, separator) {
  console.log(JSON.stringify(value.split(separator)));
}
for (const separator of [",", 2, true, 3n, null, undefined]) split("a,2true3nullz", separator);
