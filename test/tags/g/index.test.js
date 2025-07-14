const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("g", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<g transform="translate(100,100)" fill="blue">content</g>'))
})