const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../..")

test("attributes and children", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<a href="/foo">bar</a>'))
  assert(html.includes('<a href="/baz"></a>'))
  assert(html.includes("<a>qux</a>"))
})
