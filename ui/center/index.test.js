const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("renders with default props", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html)
})

test("supports id", async () => {
  const { template } = await compile(__dirname)
  const html = template({ id: "hello" })
  assert(html.includes("hello"))
})
