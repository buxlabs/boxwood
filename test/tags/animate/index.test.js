const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("animate", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<animate attributeName="opacity" from="1" to="0" dur="1s"></animate>'))
})