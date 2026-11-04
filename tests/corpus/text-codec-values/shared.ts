import { TextEncoder as UtilEncoder } from "node:util";
import { TextDecoder as UtilDecoder } from "util";

export const sharedEncoder: UtilEncoder = new UtilEncoder();
const sharedDecoder: UtilDecoder = new UtilDecoder();
export function decodeShared(bytes: Uint8Array): string {
  return sharedDecoder.decode(bytes);
}
