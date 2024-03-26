const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../..")

test("#img.load: loads image as base64", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  assert(template().includes('<img src="data:image/png;base64,MTAwMQ==">'))
  assert(template().includes('<img src="data:image/svg+xml;base64,PHN'))
})
