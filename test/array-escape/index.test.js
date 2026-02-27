const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../..")

test("arrays inside template tags should not be HTML-escaped", () => {
  const { template } = compile(join(__dirname, "./index.js"))
  const html = template()

  assert(
    html.includes("<template><div>A & B</div></template>"),
    "Expected template to contain unescaped &",
  )

  assert(!html.includes("&amp;"), "Should not contain escaped &amp;")
})
