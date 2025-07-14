const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("polyline", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<polyline points="0,100 50,25 50,75 100,0" fill="none" stroke="black"></polyline>'))
})