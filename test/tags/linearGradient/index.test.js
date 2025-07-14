const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("linearGradient", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"></linearGradient>'))
})