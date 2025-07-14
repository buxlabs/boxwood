const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("circle", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<circle cx="50" cy="50" r="40" fill="yellow" stroke="green"></circle>'))
})