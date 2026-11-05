// wasm-lane fixture: the lre-backed toUpperCase/toLowerCase pair (scr_regex.c
// + vendored libunicode) must link and run in the reactor. Samples cover the
// case-mapping edges Node handles: Greek final sigma, dotted-I, sharp-s ->
// SS length change, ligature expansion, roman-numeral case pairs, empty.
const samples = ["hello", "Ünïcödë", "straße", "ΣΊΣΥΦΟΣ", "İstanbul", "ﬀ", "Ⅷ", "HELLO", ""];

function fnv(s: string): number {
  let acc = 2166136261;
  for (let i = 0; i < s.length; i++) {
    acc = (acc ^ s.charCodeAt(i)) >>> 0;
    acc = (acc * 16777619) >>> 0;
  }
  return acc >>> 0;
}

export function up(i: number): number {
  return fnv(samples[i | 0].toUpperCase());
}

export function lo(i: number): number {
  return fnv(samples[i | 0].toLowerCase());
}
