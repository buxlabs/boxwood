const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("attributes for a div", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<script src="https://foo.bar" async></script>'))
})
