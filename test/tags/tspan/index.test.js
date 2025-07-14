const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("tspan", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<tspan x="10" y="30">Text span</tspan>'))
})