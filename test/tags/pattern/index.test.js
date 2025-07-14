const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("pattern", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<pattern id="pattern1" x="0" y="0" width="20" height="20"></pattern>'))
})