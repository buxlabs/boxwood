const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../..")

test("#classes is a function", async () => {
  const { template } = compile(__dirname)
  const html = template()
  assert.deepEqual(html, "")
})
