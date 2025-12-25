const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("component: can render with styles", async () => {
  const { template } = await compile(__dirname)
  const html = template({ text: 'Hello' })
  assert(html.includes("<div"))
  assert(html.includes("Hello"))
  assert(html.includes("<style>"))
  assert(html.includes("color:red"))
})
