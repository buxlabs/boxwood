const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../..")

test("example renders a title", () => {
  const { template } = compile(__dirname)
  const html = template()
  assert(html.includes("Hello, world!"))
})

test("example renders a description", () => {
  const { template } = compile(__dirname)
  const html = template()
  assert(html.includes("Lorem ipsum dolor sit amet"))
})
