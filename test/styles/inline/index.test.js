const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("styles and scripts can be inlined is a function", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<div style="color:red">foo</div>'))
  assert(html.includes('<div style="color:blue">bar</div>'))
  assert(html.includes('<div style="color:blue;background:red">baz</div>'))
  assert(html.includes('<div style="margin:0">qux</div>'))
  assert(html.includes('<div style="margin:0 0 0 10px">quux</div>'))
  assert(html.includes('<div style="padding:0 0 0 20px">quuux</div>'))
})
