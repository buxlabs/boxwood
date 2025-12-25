const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("i18n.load: can load translations without sanitization", async () => {
  const { template } = await compile(__dirname)
  const html = template({ language: "en" })
  // This test verifies that sanitize: false preserves potentially unsafe content
  // The translation file intentionally contains script tags to verify the option works
  assert(html.includes("<script>alert('xss')</script>Hello"))
})
