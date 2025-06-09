const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#raw.load: can load an html file", () => {
  const { template } = compile(join(__dirname, "./index.js"))
  assert(template().includes("<li>foo</li>"))
  assert(template().includes("<li>bar</li>"))
  assert(template().includes("<li>baz</li>"))
})
