const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#raw.load: can load a txt file with escaping", () => {
  const { template } = compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes("&lt;special&gt;"))
  assert(html.includes("&amp;characters&amp;"))
  assert(html.includes("&quot;escaped&quot;"))
})
