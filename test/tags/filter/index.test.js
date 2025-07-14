const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("filter", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<filter id="filter1" x="0" y="0"></filter>'))
})