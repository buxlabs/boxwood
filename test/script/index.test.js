const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../..")

test("#img.load: loads image as base64", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes('<script type="application/json">{}</script>'))
  assert(html.includes('<script type="application/ld+json">{}</script>'))
})
