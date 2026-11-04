export function linkTraceCandidate(line: string): string[] {
  const trimmed = line.trim().replace(/^(?:LOAD|load)\s+/, "");
  if (trimmed === "") return [];
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;
  const candidates = [unquoted];
  const member = unquoted.lastIndexOf("(");
  if (member > 0 && unquoted.endsWith(")")) candidates.push(unquoted.slice(0, member));
  return candidates;
}

export function driverTraceCandidates(line: string): string[] {
  const candidates: string[] = [];
  for (const match of line.matchAll(/"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g)) {
    const token = (match[1] ?? match[2] ?? match[3] ?? "").replace(/\\(["\\])/g, "$1");
    if (token !== "") candidates.push(token);
  }
  return candidates;
}
