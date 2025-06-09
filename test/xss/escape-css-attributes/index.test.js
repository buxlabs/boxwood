const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("escape css attributes", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert.deepEqual(
    html,
    '<div style="background:url(&quot;javascript:alert(1)&quot;)"></div>'
  )
})
