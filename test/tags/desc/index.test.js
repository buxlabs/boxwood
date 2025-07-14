const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("desc", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<desc>Description of the SVG</desc>'))
})