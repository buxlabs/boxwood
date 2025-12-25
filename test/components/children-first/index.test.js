const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("component: can render with children as first argument (string)", async () => {
  const { template } = await compile(__dirname)
  const html = template("Hello World")
  assert(html.includes("<div"))
  assert(html.includes("Hello World"))
})
