const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../../..")

test("head renders a title", () => {
  const { template } = compile(__dirname)
  const html = template()
  assert(html.includes("<title>example</title>"))
})
