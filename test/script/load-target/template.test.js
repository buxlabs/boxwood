const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#js.load: can load a JS file with target option", () => {
  const { template } = compile(join(__dirname, "./template.js"))
  const html = template()
  assert(html.includes("<script"))
  assert(html.includes("target test"))
})
