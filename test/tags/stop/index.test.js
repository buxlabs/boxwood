const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("stop", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1"></stop>'))
})