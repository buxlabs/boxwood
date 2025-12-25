const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("sanitizeHTML: removes javascript: URLs", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  assert.ok(!html.includes('href="javascript:'), "Should remove javascript: from href")
  assert.ok(!html.includes('src="javascript:'), "Should remove javascript: from src")
  assert.ok(!html.includes('action="javascript:'), "Should remove javascript: from action")
})

test("sanitizeHTML: removes data:text/html URLs", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // data: URLs with text/html content type can execute scripts
  assert.ok(!html.includes('data:text/html'), "Should remove data:text/html URLs")
  assert.ok(html.includes("Safe content"), "Should preserve safe content")
})

test("sanitizeHTML: removes vbscript: URLs", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  
  // VBScript is another script protocol (legacy IE)
  assert.ok(!html.includes('vbscript:'), "Should remove vbscript: URLs")
  assert.ok(html.includes("Safe content"), "Should preserve safe content")
})
