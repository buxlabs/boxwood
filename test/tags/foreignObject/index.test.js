const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("foreignObject", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<foreignObject x="10" y="10" width="100" height="100"></foreignObject>'))
})