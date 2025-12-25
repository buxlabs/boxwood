const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("renders plain objects as empty string", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.strictEqual(html, "<div>text</div>")
  assert(!html.includes("foo"))
  assert(!html.includes("bar"))
})
