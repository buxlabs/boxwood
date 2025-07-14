const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("mask", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<mask id="mask1" x="0" y="0" width="100" height="100"></mask>'))
})