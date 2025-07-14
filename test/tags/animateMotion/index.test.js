const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("animateMotion", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<animateMotion path="M 0,0 L 100,100" dur="5s"></animateMotion>'))
})