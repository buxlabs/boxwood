const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("view", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<view id="view1" viewBox="0 0 100 100"></view>'))
})