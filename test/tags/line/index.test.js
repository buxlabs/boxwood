const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("line", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<line x1="0" y1="0" x2="200" y2="200" stroke="red"></line>'))
})