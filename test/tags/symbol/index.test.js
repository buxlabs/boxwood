const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("symbol", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<symbol id="sym1" viewBox="0 0 100 100"></symbol>'))
})