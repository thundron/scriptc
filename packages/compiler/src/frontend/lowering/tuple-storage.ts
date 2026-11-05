/* Homogeneous tuples written through runtime indices need array storage:
 * writes can grow their length and aliases must see those new elements.
 * Select the representation before any signature or field maps. Arity is a
 * program-wide family so generic, readonly and mutable views agree. */
import * as ts from "../ts7/adapter.js";

export function growableTupleArities(
  files: readonly ts.SourceFile[],
  checker: ts.TypeChecker,
): ReadonlySet<number> {
  const arities = new Set<number>();
  for (const file of files) {
    if (file.isDeclarationFile) continue;
    ts.walkPreorder(file, (node) => {
      let target: ts.Expression | undefined;
      if (ts.isBinaryExpression(node) && ts.isAssignmentOperator(node.operatorToken.kind))
        target = node.left;
      else if (
        (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        (node.operator === ts.SyntaxKind.PlusPlusToken ||
          node.operator === ts.SyntaxKind.MinusMinusToken)
      )
        target = node.operand;
      while (target && ts.isParenthesizedExpression(target)) target = target.expression;
      if (
        !target ||
        !ts.isElementAccessExpression(target) ||
        ts.isNumericLiteral(target.argumentExpression) ||
        ts.isStringLiteral(target.argumentExpression)
      )
        return;
      const key = target.argumentExpression;
      if (
        ts.isPrefixUnaryExpression(key) &&
        ts.isNumericLiteral(key.operand) &&
        (key.operator === ts.SyntaxKind.PlusToken || key.operator === ts.SyntaxKind.MinusToken)
      )
        return;
      const type = checker.getTypeAtLocation(target.expression);
      if (checker.isTupleType(type))
        arities.add(checker.getTypeArguments(type as ts.TypeReference).length);
    });
  }
  return arities;
}
