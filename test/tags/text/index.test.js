const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("text", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<text x="10" y="30" fill="black">Hello SVG</text>'))
})