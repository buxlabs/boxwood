const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("html", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<html lang="en"></html>'))
})
