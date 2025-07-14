const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("set", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<set to="red" begin="click" attributeName="fill"></set>'))
})