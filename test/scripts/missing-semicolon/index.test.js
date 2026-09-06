const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")
const { parseInlineScript, declarations } = require("../helpers")

test("scripts without trailing semicolons stay independent", async () => {
  const { template } = await compile(__dirname)
  const tree = parseInlineScript(template())

  assert.equal(tree.body.length, 2)
  assert.equal(declarations(tree, "first").length, 1)
  // The second statement is a call of its own function, not of `first`
  assert.equal(tree.body[1].type, "ExpressionStatement")
  assert.equal(tree.body[1].expression.callee.type, "FunctionExpression")
})
