const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("renders children", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<h1 id="h1">h1</h1>'))
  assert(html.includes('<h2 id="h2">h2</h2>'))
  assert(html.includes('<h3 id="h3">h3</h3>'))
  assert(html.includes('<h4 id="h4">h4</h4>'))
  assert(html.includes('<h5 id="h5">h5</h5>'))
  assert(html.includes('<h6 id="h6">h6</h6>'))
  assert(html.includes("<p>paragraph</p>"))
  assert(html.includes("<blockquote><p>blockquote</p></blockquote>"), html)
})

test("returns empty for null input", async () => {
  const { template } = await compile(__dirname)
  const html = template(null)
  // When explicitly passing null, it should render nothing
  assert.strictEqual(html, "")
})
