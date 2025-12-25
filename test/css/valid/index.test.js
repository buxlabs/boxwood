const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#css.load: can load a valid CSS file", () => {
  const { template } = compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes("<style>"))
  assert(html.includes("color:red"))
  assert(html.includes("background:blue"))
})
