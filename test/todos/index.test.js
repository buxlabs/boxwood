const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../..")

test("renders todos", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    title: "foo",
    subtitle: "bar",
    todos: [{ description: "baz" }, { description: "qux" }],
  })
  assert(html.includes("<h1>foo</h1>"))
  assert(html.includes("<h2>bar</h2>"))
  assert(html.includes("<ul><li>baz</li><li>qux</li></ul>"))
})
