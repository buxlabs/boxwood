const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")
const { parseInlineScript, wrappers } = require("../helpers")

test("scripts sharing a global are not wrapped", async () => {
  const { template } = await compile(__dirname)
  const tree = parseInlineScript(template())

  assert.equal(wrappers(tree).length, 0)
  assert.equal(tree.body[0].type, "FunctionDeclaration")
  assert.equal(tree.body[0].id.name, "helper")
})
