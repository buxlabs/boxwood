const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("hgroup", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<hgroup>Heading Group</hgroup>'))
})