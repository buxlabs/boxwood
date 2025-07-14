const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("textPath", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<textPath href="#path1">Text on path</textPath>'))
})