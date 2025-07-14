const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("metadata", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<metadata>metadata content</metadata>'))
})