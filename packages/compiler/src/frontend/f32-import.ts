import type { IrLibFn } from "../ir/ir.js";
import * as ts from "./ts7/adapter.js";

export const F32_MODULE = "@scriptc/experimental/f32";
export const F32_OPERATIONS = {
  round: { fn: "math.fround", arity: 1, result: "number" },
  add: { fn: "math.f32Add", arity: 2, result: "number" },
  sub: { fn: "math.f32Sub", arity: 2, result: "number" },
  mul: { fn: "math.f32Mul", arity: 2, result: "number" },
  div: { fn: "math.f32Div", arity: 2, result: "number" },
  rem: { fn: "math.f32Rem", arity: 2, result: "number" },
  sqrt: { fn: "math.f32Sqrt", arity: 1, result: "number" },
  abs: { fn: "math.f32Abs", arity: 1, result: "number" },
  neg: { fn: "math.f32Neg", arity: 1, result: "number" },
  min: { fn: "math.f32Min", arity: 2, result: "number" },
  max: { fn: "math.f32Max", arity: 2, result: "number" },
  add4: { fn: "f32x4.add", arity: 6, result: "void" },
  sub4: { fn: "f32x4.sub", arity: 6, result: "void" },
  mul4: { fn: "f32x4.mul", arity: 6, result: "void" },
  div4: { fn: "f32x4.div", arity: 6, result: "void" },
  min4: { fn: "f32x4.min", arity: 6, result: "void" },
  max4: { fn: "f32x4.max", arity: 6, result: "void" },
  allocateShared: { fn: "shared.f32New", arity: 1, result: "number" },
  shared: { fn: "shared.f32View", arity: 1, result: "array" },
  sharedReadOnly: { fn: "shared.f32ReadOnlyView", arity: 1, result: "array" },
  releaseShared: { fn: "shared.f32Release", arity: 1, result: "void" },
} as const satisfies Record<
  string,
  { fn: IrLibFn; arity: number; result: "number" | "array" | "void" }
>;

export function f32ImportsOf(
  sources: readonly ts.SourceFile[],
): ReadonlyMap<ts.SourceFile, ReadonlySet<string>> {
  const bindings = new Map<ts.SourceFile, ReadonlySet<string>>();
  for (const source of sources) {
    if (
      source.statements.nodes.some(
        (statement) =>
          ts.isImportDeclaration(statement) &&
          ts.isStringLiteral(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text === F32_MODULE,
      )
    )
      bindings.set(source, importedNames(source));
  }
  return bindings;
}

function importedNames(source: ts.SourceFile): ReadonlySet<string> {
  const names = new Set<string>();
  for (const statement of source.statements.nodes) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== F32_MODULE
    )
      continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) names.add(bindings.name.text);
    else if (bindings && ts.isNamedImports(bindings))
      for (const specifier of bindings.elements.nodes) names.add(specifier.name.text);
  }
  return names;
}

/** Only bindings imported from our module qualify, never a matching name on
 * a user object. Named aliases and namespace imports have the same contract. */
export function f32CallOf(
  program: ts.Program,
  callee: ts.Expression,
  bindings: ReadonlyMap<ts.SourceFile, ReadonlySet<string>>,
): ((typeof F32_OPERATIONS)[keyof typeof F32_OPERATIONS] & { name: string }) | null {
  let name: string;
  let binding: ts.Identifier;
  let namespace = false;
  if (ts.isIdentifier(callee)) {
    binding = callee;
    name = callee.text;
  } else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
    binding = callee.expression;
    name = callee.name.text;
    namespace = true;
  } else if (
    ts.isElementAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.argumentExpression &&
    ts.isStringLiteral(callee.argumentExpression)
  ) {
    binding = callee.expression;
    name = callee.argumentExpression.text;
    namespace = true;
  } else return null;
  if (!bindings.get(ts.getSourceFileOfNode(binding))?.has(binding.text)) return null;
  const declaration = program.getTypeChecker().getSymbolAtLocation(binding)?.declarations[0];
  let imported: ts.Node | undefined;
  if (declaration && !namespace && ts.isImportSpecifier(declaration)) {
    name = declaration.propertyName?.text ?? declaration.name.text;
    imported = declaration.parent?.parent?.parent;
  } else if (declaration && namespace && ts.isNamespaceImport(declaration)) {
    imported = declaration.parent?.parent;
  } else return null;
  if (
    !imported ||
    !ts.isImportDeclaration(imported) ||
    !ts.isStringLiteral(imported.moduleSpecifier) ||
    imported.moduleSpecifier.text !== F32_MODULE
  )
    return null;
  return Object.hasOwn(F32_OPERATIONS, name)
    ? { ...F32_OPERATIONS[name as keyof typeof F32_OPERATIONS], name }
    : null;
}
