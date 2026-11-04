import { Ts7Api } from "./rpc-api.js";
import { Ts7SourceParser, type Ts7SourceKind } from "./source-parser.js";
import type { SourceFile } from "./ast-types.js";

let parser: Ts7SourceParser | undefined;

/** The Node entry owns one lazy syntax server. The transport's existing
 * exit hook closes it; a long-lived compiler retains only its last input. */
export function parseSourceFile(fileName: string, source: string, kind: Ts7SourceKind): SourceFile {
  parser ??= new Ts7SourceParser((options) => new Ts7Api(options));
  return parser.parse(fileName, source, kind);
}

export function closeSourceParser(): void {
  const previous = parser;
  parser = undefined;
  previous?.close();
}
