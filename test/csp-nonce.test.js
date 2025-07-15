const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("..")
const { join } = require("path")

test("script tags include nonce attribute when provided", async () => {
  const { template } = await compile(join(__dirname, "scripts", "target"))
  const nonce = "random-nonce-123"
  const html = template({ nonce })
  
  // Check that the script tag in head includes the nonce
  assert.ok(html.includes(`<script nonce="${nonce}">`))
  assert.ok(html.includes('const foo = {}'))
})

test("script tags do not include nonce attribute when not provided", async () => {
  const { template } = await compile(join(__dirname, "scripts", "target"))
  const html = template()
  
  // Check that the script tag does not include nonce
  assert.ok(!html.includes('nonce='))
  assert.ok(html.includes('<script>'))
})

test("both head and body script tags include nonce attribute", async () => {
  const { template } = await compile(join(__dirname, "csp-nonce-body"))
  const nonce = "test-nonce-456"
  const html = template({ nonce })
  
  // Count occurrences of nonce attribute
  const nonceMatches = html.match(new RegExp(`nonce="${nonce}"`, 'g'))
  assert.equal(nonceMatches.length, 2, 'Should have 2 script tags with nonce')
  
  // Verify content is present
  assert.ok(html.includes('console.log("head script")'))
  assert.ok(html.includes('console.log("body script")'))
  
  // Verify structure
  assert.ok(html.includes('</head>'))
  assert.ok(html.includes('</body>'))
})