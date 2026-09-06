const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")
const { parseInlineScript, wrappers, declarations } = require("../helpers")

test("a nested declaration is not treated as a collision", async () => {
  const { template } = await compile(__dirname)
  const tree = parseInlineScript(template())

  assert.equal(wrappers(tree).length, 0)
  assert.equal(declarations(tree, "state").length, 1)
})
