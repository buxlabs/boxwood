const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("marker", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<marker id="arrow" markerWidth="10" markerHeight="10"></marker>'))
})