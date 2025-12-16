const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("renders with default props", async () => {
  const { template } = await compile(__dirname)
  const html = template("foo")
  assert(html.includes("foo"))
})

test("supports id", async () => {
  const { template } = await compile(__dirname)
  const html = template({ id: "hello" }, "bar")
  assert(html.includes("hello"))
  assert(html.includes("bar"))
})
