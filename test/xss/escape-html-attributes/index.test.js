const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("escape html attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.deepEqual(html, '<input value="&quot; onfocus=&quot;alert(1)">')
})
