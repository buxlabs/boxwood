const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("nested elements", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // Test nested elements without arrays
  assert(html.includes("<ul><li><a>Hello</a></li></ul>"))

  // Test nested elements with arrays
  assert(html.includes("<ul><li><a>World</a></li></ul>"))

  // Test nested elements with attributes
  assert(html.includes('<ul><li><a href="#">Link</a></li></ul>'))

  // Test deeply nested elements
  assert(html.includes("<div><div><div><span>Deep</span></div></div></div>"))

  // Test that name attribute doesn't confuse the tag function
  assert(html.includes('<div name="myDiv" id="test">Content</div>'))
})
