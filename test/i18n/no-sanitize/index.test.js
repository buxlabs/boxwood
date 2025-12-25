const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("i18n.load: can load translations without sanitization", async () => {
  const { template } = await compile(__dirname)
  const html = template({ language: "en" })
  assert(html.includes("<script>alert('xss')</script>Hello"))
})
