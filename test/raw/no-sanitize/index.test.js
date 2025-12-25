const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#raw.load: can load html file without sanitization", () => {
  const { template } = compile(join(__dirname, "./index.js"))
  const html = template()
  // This test verifies that sanitize: false preserves potentially unsafe content
  // The test file intentionally contains script tags to verify the option works
  assert(html.includes("<script>alert('xss')</script>"))
  assert(html.includes("<p>Content</p>"))
})
