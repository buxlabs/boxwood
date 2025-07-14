const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("ellipse", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<ellipse cx="100" cy="50" rx="100" ry="50" fill="lime"></ellipse>'))
})