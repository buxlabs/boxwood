const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("menu", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<menu type="toolbar">Menu items</menu>'))
})