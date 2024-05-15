const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("banner renders a title", async () => {
  const { template } = await compile(__dirname)
  const html = template({ title: "foo" })
  assert(html.includes("<h1>foo</h1>"))
})

test("banner renders an optional description", async () => {
  const { template } = await compile(__dirname)
  const html = template({ title: "foo", description: "bar" })
  assert(html.includes("<h1>foo</h1>"))
  assert(html.includes("<p>bar</p>"))
})
