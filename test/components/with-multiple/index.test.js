const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("component: can render with multiple styles and scripts", async () => {
  const { template } = await compile(__dirname)
  const html = template({ text: 'Hello' })
  assert(html.includes("<div"))
  assert(html.includes("Hello"))
  assert(html.includes("<style>"))
  assert(html.includes("color:red"))
  assert(html.includes("color:blue"))
  assert(html.includes("<script>"))
  // The merged bundle is generated from a syntax tree, so quoting and
  // statement termination are normalised
  assert(html.includes('console.log("one");'))
  assert(html.includes('console.log("two");'))
})
