const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("polygon", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<polygon points="100,10 40,198 190,78 10,78 160,198" fill="purple"></polygon>'))
})