const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("styles and scripts can be inlined is a function", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>hello, world!</div>"))
  assert(html.includes("<style>div{color:red}</style>"))
  // A lone script is generated from its tree like any other, so quotes are
  // normalised and a semicolon is added.
  assert(html.includes('<script>alert("hello, world!");\n</script>'))
})
