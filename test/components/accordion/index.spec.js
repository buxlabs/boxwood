const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/accordion: it returns a component with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  const html = template({ title: "foo" }, "bar")
  assert(html.includes('<h3 class="__accordion__1pc2b">foo</h3>'))
  assert(
    html.includes('<div class="__content__1pc2b __hidden__1pc2b">bar</div>')
  )
})
