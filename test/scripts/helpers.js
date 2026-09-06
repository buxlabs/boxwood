const { parse } = require("abstract-syntax-tree")

const INLINE_SCRIPT =
  /<script(?![^>]*\bsrc=)(?![^>]*\btype=)[^>]*>([\s\S]*?)<\/script>/g

function inlineScripts(html) {
  const results = []
  let match
  INLINE_SCRIPT.lastIndex = 0
  while ((match = INLINE_SCRIPT.exec(html))) {
    results.push(match[1])
  }
  return results
}

/*
 * The point of the syntax tree pipeline is that the emitted bundle is always
 * valid JavaScript. An includes() assertion cannot check that on its own -
 * concatenating two scripts without a separator used to produce a string that
 * looked right and parsed as something else entirely.
 */
function parseInlineScript(html) {
  const scripts = inlineScripts(html)
  if (scripts.length !== 1) {
    throw new Error(`expected exactly one inline script, found ${scripts.length}`)
  }
  return parse(scripts[0])
}

// An immediately invoked function expression added by the merge step
function wrappers(tree) {
  return tree.body.filter(
    (node) =>
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression" &&
      node.expression.callee.type === "FunctionExpression"
  )
}

function declarations(tree, name) {
  return tree.body.filter(
    (node) =>
      node.type === "VariableDeclaration" &&
      node.declarations.some((declaration) => declaration.id.name === name)
  )
}

module.exports = { inlineScripts, parseInlineScript, wrappers, declarations }
