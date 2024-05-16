const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("attributes for a div", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(
    html.includes(
      '<img src="https://example.com/image.jpg" alt="Example image" width="100" height="100">'
    )
  )
})
