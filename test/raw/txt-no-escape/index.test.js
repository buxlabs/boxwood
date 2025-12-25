const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#raw.load: can load txt file without escaping", () => {
  const { template } = compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes("<html>"))
})
