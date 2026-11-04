/** The fixed-width Buffer numeric methods by source name → the readNum/
 * writeNum kind token. Node declares BOTH capitalizations ("UInt" is the
 * original, "Uint" the aliased spelling) — the tables carry both. */
export const BUF_NUM_METHODS: Record<string, string | undefined> = (() => {
  const out: Record<string, string> = {};
  for (const rw of ["read", "write"]) {
    for (const u of ["UInt", "Uint"]) {
      out[`${rw}${u}8`] = "u8";
      out[`${rw}${u}16BE`] = "u16be";
      out[`${rw}${u}16LE`] = "u16le";
      out[`${rw}${u}32BE`] = "u32be";
      out[`${rw}${u}32LE`] = "u32le";
    }
    out[`${rw}Int8`] = "i8";
    out[`${rw}Int16BE`] = "i16be";
    out[`${rw}Int16LE`] = "i16le";
    out[`${rw}Int32BE`] = "i32be";
    out[`${rw}Int32LE`] = "i32le";
    out[`${rw}FloatBE`] = "f32be";
    out[`${rw}FloatLE`] = "f32le";
    out[`${rw}DoubleBE`] = "f64be";
    out[`${rw}DoubleLE`] = "f64le";
  }
  return out;
})();
