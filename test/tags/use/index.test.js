const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("use", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes('<use href="#sym1" x="50" y="50"></use>'))
})