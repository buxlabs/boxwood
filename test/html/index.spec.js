const test = require("ava")
const { join } = require("path")
const { compile } = require("../..")

test("#svg: it returns an svg", async (assert) => {
  const { template } = await compile(join(__dirname, "./index.js"))
  assert.truthy(template().includes("<li>foo</li>"))
  assert.truthy(template().includes("<li>bar</li>"))
  assert.truthy(template().includes("<li>baz</li>"))
  console.log(template())
})
