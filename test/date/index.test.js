const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../..")

test("renders date as string", async () => {
  const { template } = compile(__dirname)
  const html = template({
    date: new Date(Date.UTC(2000, 0, 0)),
  })
  assert(html)
})
