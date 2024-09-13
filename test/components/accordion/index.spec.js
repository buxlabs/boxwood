const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/accordion: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  const html = template({ title: "foo" }, "bar")
  assert(html.includes('<h3 class="accordion_1pc2b">foo</h3>'))
  assert(html.includes('<div class="content_1pc2b hidden_1pc2b">bar</div>'))
})
