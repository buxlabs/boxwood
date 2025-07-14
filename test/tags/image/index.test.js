const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("image", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<image href="image.png" x="0" y="0" width="100" height="100"></image>'))
})