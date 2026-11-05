import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadProgram, checkPreflight } from "../../../packages/compiler/src/frontend/program.js";
import type { FrontendServices } from "../../../packages/compiler/src/frontend/services.js";
import type { ScrDiagnostic } from "../../../packages/compiler/src/diagnostics/diagnostic.js";

export interface FrontendProgramRequest {
  root: string;
  cases: {
    name: string;
    entry: string;
    npmStatic: string[];
    externalTypes: [string, string][];
    edits: { path: string; source: string }[];
  }[];
}

interface DiagnosticReport {
  code: string;
  message: string;
  file: string;
  start: number;
  end: number;
}

interface ProgramReport {
  name: string;
  error: string;
  diagnostics: DiagnosticReport[];
  order: string[];
  sources: { path: string; text: string }[];
  external: { file: string; specifiers: string[] }[];
  startup: { message: string; className: string; file: string; start: number; end: number } | null;
  entryIdentity: boolean;
  released: boolean;
}

function normalized(value: string, root: string): string {
  return value.split("\\").join("/")
    .split(realpathSync(root).split("\\").join("/") + "/").join("")
    .split(root.split("\\").join("/") + "/").join("");
}

function diagnosticReport(diagnostic: ScrDiagnostic, root: string): DiagnosticReport {
  return {
    code: diagnostic.code,
    message: normalized(diagnostic.message, root),
    file: normalized(diagnostic.loc.file, root),
    start: diagnostic.loc.start,
    end: diagnostic.loc.end,
  };
}

/** Run the production loader repeatedly through one service owner. Each load
 * owns its program host; malformed inputs must not poison later projects. */
export function runFrontendPrograms(services: FrontendServices, input: string, output: string): void {
  const request = JSON.parse(readFileSync(input, "utf8")) as FrontendProgramRequest;
  const reports: ProgramReport[] = [];
  for (const item of request.cases) {
    for (const edit of item.edits) writeFileSync(join(request.root, edit.path), edit.source);
    const report: ProgramReport = {
      name: item.name, error: "", diagnostics: [], order: [], sources: [], external: [],
      startup: null, entryIdentity: false, released: false,
    };
    try {
      const entry = join(request.root, item.entry);
      const load = loadProgram(entry, services, {
        npmStatic: item.npmStatic,
        externalTypes: item.externalTypes.map(([specifier, path]) => [specifier, join(request.root, path)]),
      });
      try {
        report.entryIdentity = load.program.getSourceFile(entry) === load.entry;
        report.diagnostics = checkPreflight(load).map((diagnostic) => diagnosticReport(diagnostic, request.root));
        report.order = load.moduleOrder.map((source) => normalized(source.fileName, request.root));
        report.sources = load.program.getSourceFiles()
          .filter((source) => !source.isDeclarationFile)
          .map((source) => ({ path: normalized(source.fileName, request.root), text: source.text }));
        for (const [file, specifiers] of load.externalTypeSpecifiersByFile) {
          report.external.push({ file: normalized(file, request.root), specifiers: [...specifiers] });
        }
        const crash = load.startupCrash;
        if (crash !== undefined && crash !== null) report.startup = {
          message: normalized(crash.message, request.root), className: crash.className,
          file: normalized(crash.loc.file, request.root), start: crash.loc.start, end: crash.loc.end,
        };
      } finally { load.dispose(); }
      report.released = load.program.analysis.nodeEsmFiles.size === 0 && load.program.analysis.createRequireReasons.size === 0;
    } catch (error) {
      report.error = normalized(error instanceof Error ? error.message : String(error), request.root);
    }
    reports.push(report);
    // Retain completed cases when a later native run crashes or times out.
    writeFileSync(output, JSON.stringify(reports));
  }
  services.close();
  let refused = false;
  try { services.createProgramHost(); } catch { refused = true; }
  if (!refused) throw new Error("closed frontend services accepted a new program host");
  services.close();
}
