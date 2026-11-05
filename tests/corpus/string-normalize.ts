for (const form of ['NFC', 'NFD', 'NFKC', 'NFKD']) {
  console.log(form, 'e\u0301 Å ﬃ ① 한 😀'.normalize(form));
}
console.log('default', 'e\u0301'.normalize(), 'e\u0301'.normalize(undefined));
console.log('empty', ''.normalize(), 'already', 'café'.normalize());
try { 'hello'.normalize('bad'); } catch (error) { if (error instanceof Error) console.log(error.name, error.message); }
