const test = require("ava")
const { join } = require("path")
const { compile } = require("../..")

test("#img.load: loads image as base64", async (assert) => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  assert.truthy(html.includes('<script type="application/ld+json">{}</script>'))
})
