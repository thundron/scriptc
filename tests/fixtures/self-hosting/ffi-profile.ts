import { loadFfiProfile } from "../../../packages/compiler/src/ffi/ffi-manifest.js";

const result = loadFfiProfile(process.argv[2]!);
// Compare byte contents independently of Node's Buffer.toJSON wrapper.
console.log(JSON.stringify(result.ok
  ? { ok: true, profile: result.profile, profileBytes: Array.from(result.profileBytes) }
  : result));
