const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/accordion: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  const html = template({ title: "foo" }, "bar")
  assert(html.includes('<h3 class="accordion_ue4mvh">foo</h3>'))
  assert(html.includes('<div class="content_mkc40k hidden_dpvuxj">bar</div>'))
})
