const data: Record<string, unknown> = JSON.parse('{"types":"index.d.ts","main":"index.js"}');
const view = data as Record<string, unknown>;
delete view.types;
console.log(JSON.stringify(data), JSON.stringify(Object.keys(view)));
const exports: Record<string, unknown> = JSON.parse('{"types":"index.d.ts","node":"index.js"}');
const alias: unknown = exports;
delete (alias as Record<string, unknown>).types;
console.log(JSON.stringify(exports), "types" in exports);
