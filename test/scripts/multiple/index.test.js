const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test.skip("styles and scripts can be inlined is a function", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(
    html.includes("<script>console.log('foo');console.log('bar');</script>")
  )
})
