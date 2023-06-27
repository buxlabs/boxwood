const test = require("ava")
const { join } = require("path")
const { compile } = require("../..")

test("#img.load: loads image as base64", async (assert) => {
  const { template } = await compile(join(__dirname, "./index.js"))
  assert.truthy(
    template().includes('<img src="data:image/png;base64,MTAwMQ==">')
  )
})
