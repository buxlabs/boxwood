const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("div", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<div data-foo="1" data-bar="0">baz</div>'))
})
