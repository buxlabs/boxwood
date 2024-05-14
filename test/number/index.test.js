const test = require("node:test")
const assert = require("node:assert")

const { compile } = require("../..")

test("", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.deepEqual(html, "42")
})
