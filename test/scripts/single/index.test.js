const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("styles and scripts can be inlined is a function", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  console.log(html)
  assert(html.includes("<div>hello, world!</div>"))
  assert(html.includes("<style>div{color:red}</style>"))
  assert(html.includes("<script>console.log('hello, world!')</script>"))
})
