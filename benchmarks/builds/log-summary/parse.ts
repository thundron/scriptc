export interface Request { route: string; status: number; milliseconds: number; bytes: number }
export function parse(line: string): Request | null {
  const fields = line.split(" ");
  if (fields.length !== 4) return null;
  const status = Number(fields[1]);
  const milliseconds = Number(fields[2]);
  const bytes = Number(fields[3]);
  if (!Number.isFinite(status) || !Number.isFinite(milliseconds) || !Number.isFinite(bytes)) return null;
  const raw = fields[0]!;
  const query = raw.indexOf("?");
  return { route: query < 0 ? raw : raw.slice(0, query), status, milliseconds, bytes };
}
