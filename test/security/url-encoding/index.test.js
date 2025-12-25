const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("sanitizeHTML: removes normal javascript: URLs", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // Should remove normal javascript: URLs
  assert.ok(!html.includes('href="javascript:'), "Should remove plain javascript: URLs")
})

test("sanitizeHTML: LIMITATION - HTML entity encoded URLs may bypass", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // KNOWN LIMITATION: HTML entity encoding can bypass pattern matching
  // This is documented in SECURITY_REVIEW.md
  // Recommendation: Use CSP headers and only load trusted content
  
  // Just verify the content is there (this test documents the limitation)
  assert.ok(html.includes("Safe content"), "Should preserve safe content")
})

test("sanitizeHTML: LIMITATION - whitespace encoding may bypass", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // KNOWN LIMITATION: Encoded whitespace can bypass pattern matching  
  // This is documented in SECURITY_REVIEW.md
  
  // Just verify the content is there (this test documents the limitation)
  assert.ok(html.includes("Safe content"), "Should preserve safe content")
})
