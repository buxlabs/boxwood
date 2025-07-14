const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("path", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<path d="M10 10 H 90 V 90 H 10 Z" fill="red" stroke="blue"></path>'))
})