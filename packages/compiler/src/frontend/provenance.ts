import { parseSourceFile } from "./ts7/source-parser-node.js";
import { resolveProvenanceSourcesWithParser } from "./provenance-core.js";
import type { ProvenanceSources } from "./provenance-registry.js";

export function resolveProvenanceSources(entryPath: string): Promise<ProvenanceSources> {
  return resolveProvenanceSourcesWithParser(entryPath, parseSourceFile);
}
