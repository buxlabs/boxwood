const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("sanitizeHTML: removes case-insensitive script tags", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // Should remove all variations of script tags
  assert.ok(!html.includes("<script"), "Should remove lowercase script tags")
  assert.ok(!html.includes("<SCRIPT"), "Should remove uppercase SCRIPT tags")
  assert.ok(!html.includes("<ScRiPt"), "Should remove mixed case ScRiPt tags")
  assert.ok(!html.includes("alert('xss')"), "Should remove script content")
})

test("sanitizeHTML: removes case-insensitive event handlers", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // Should remove all variations of event handlers
  assert.ok(!html.includes("onerror="), "Should remove lowercase onerror")
  assert.ok(!html.includes("OnError="), "Should remove mixed case OnError")
  assert.ok(!html.includes("ONERROR="), "Should remove uppercase ONERROR")
  assert.ok(!html.includes("onload="), "Should remove onload")
  assert.ok(!html.includes("onclick="), "Should remove onclick")
})

test("sanitizeHTML: removes case-insensitive javascript: URLs", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // Should remove all variations of javascript: URLs
  assert.ok(!html.includes("javascript:"), "Should remove lowercase javascript:")
  assert.ok(!html.includes("JavaScript:"), "Should remove mixed case JavaScript:")
  assert.ok(!html.includes("JAVASCRIPT:"), "Should remove uppercase JAVASCRIPT:")
})

test("sanitizeHTML: preserves safe content", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // Should preserve safe content
  assert.ok(html.includes("Safe content"), "Should preserve safe paragraph content")
})
