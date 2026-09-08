const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("component: can render with scripts", async () => {
  const { template } = await compile(__dirname)
  const html = template({ text: 'Hello' })
  assert(html.includes("<div"))
  assert(html.includes("Hello"))
  assert(html.includes("<script>"))
  // Quotes are normalised because every bundle is generated from its tree.
  assert(html.includes('console.log("test")'))
})
