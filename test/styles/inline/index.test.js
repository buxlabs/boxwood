const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("styles and scripts can be inlined is a function", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.deepEqual(
    html,
    '<div style="color:red">foo</div><div style="color:blue">bar</div><div style="color:blue;background:red">baz</div>'
  )
})
