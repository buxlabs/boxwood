const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")
const { parseInlineScript, wrappers, declarations } = require("../helpers")

test("a redeclared name is isolated, the first script is left alone", async () => {
  const { template } = await compile(__dirname)
  const tree = parseInlineScript(template())

  // The first script keeps its declaration at the top level
  assert.equal(declarations(tree, "state").length, 1)
  // Only the colliding script pays for a wrapper
  assert.equal(wrappers(tree).length, 1)
})
