const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/accordion: it returns a component with css", () => {
  const { template } = compile(join(__dirname, "./index.js"))

  const html = template({ title: "foo" }, "bar")
  // The class is the styling, the data attributes are the script's hooks and
  // the state it toggles.
  assert(html.includes('<h3 class="c1" data-accordion="">foo</h3>'))
  assert(
    html.includes('<div class="c2" data-content="" data-hidden="">bar</div>'),
  )
})
