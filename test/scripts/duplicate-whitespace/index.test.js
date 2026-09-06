const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")
const { parseInlineScript } = require("../helpers")

test("scripts differing only in whitespace are emitted once", async () => {
  const { template } = await compile(__dirname)
  const tree = parseInlineScript(template())

  assert.equal(tree.body.length, 1)
})
