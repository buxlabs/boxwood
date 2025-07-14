const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("animateTransform", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s"></animateTransform>'))
})