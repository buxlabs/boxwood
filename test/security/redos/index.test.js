const test = require("node:test")
const assert = require("node:assert")

test("attribute validation regex: no ReDoS with long strings", () => {
  // Test that the key validation regex doesn't have ReDoS vulnerability
  const start = Date.now()
  
  // Create a very long attribute name with invalid characters
  const longKey = "a".repeat(10000) + "!"
  const attrs = {}
  attrs[longKey] = "value"
  
  const { tag } = require("../../..")
  const result = tag("div", attrs, "content")
  
  const duration = Date.now() - start
  
  // Should complete in reasonable time (< 100ms)
  assert.ok(duration < 100, `Regex validation took ${duration}ms, possible ReDoS`)
})

test("sanitizeHTML regex: no ReDoS with nested tags", () => {
  // Test that sanitization doesn't have ReDoS vulnerability
  const start = Date.now()
  
  // Create deeply nested script tags
  let nested = "<p>content</p>"
  for (let i = 0; i < 100; i++) {
    nested = `<script>${nested}</script>`
  }
  
  const { raw } = require("../../..")
  const { writeFileSync, unlinkSync } = require("fs")
  const path = __dirname + "/nested.html"
  
  writeFileSync(path, nested)
  
  try {
    const result = raw.load(path)
    const duration = Date.now() - start
    
    // Should complete in reasonable time (< 1000ms for 100 levels)
    assert.ok(duration < 1000, `Sanitization took ${duration}ms, possible ReDoS`)
  } finally {
    try { unlinkSync(path) } catch {}
  }
})
