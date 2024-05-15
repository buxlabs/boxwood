const test = require("node:test")
const assert = require("node:assert")

const { compile } = require("../..")

test("numbers", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.deepEqual(html, "-10142")
})
