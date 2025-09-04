const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("renders", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>foo</div>"))
  assert(html.includes("<div>bar</div>"))
})

test("has styles", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<style>"))
  assert(html.includes("display:flex"))
  assert(html.includes("</style>"))
})
