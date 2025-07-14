const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("clipPath", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<clipPath id="clip1"></clipPath>'))
})