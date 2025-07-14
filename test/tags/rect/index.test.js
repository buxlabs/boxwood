const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("rect", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<rect x="10" y="10" width="80" height="80" fill="skyblue"></rect>'))
})