const test = require("node:test")
const assert = require("node:assert")

const { compile } = require("../..")

test("booleans does not render anything", () => {
  const { template } = compile(__dirname)
  const html = template()
  assert.deepEqual(html, "<div></div>")
})
