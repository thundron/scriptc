function decode(label) {
  return new TextDecoder(label).decode(new Uint8Array([0x68, 0x69]));
}
console.log(decode(), decode(" \tUTF-8\r\n"), decode("latin1"));
for (const label of ["bad", "", "utf-8\u00a0"]) {
  try {
    decode(label);
  } catch (error) {
    console.log(error.name, error.code, error.message);
  }
}
