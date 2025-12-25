const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("attributes: handles null and undefined", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>No attrs</div>"))
  assert(html.includes("<div>No attrs 2</div>"))
})

test("attributes: filters invalid style keys", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("color:red"))
  assert(!html.includes("invalid-key!"))
})
