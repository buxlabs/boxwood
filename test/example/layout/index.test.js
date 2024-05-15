const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("layout renders an html tag with a lang attribute", async () => {
  const { template } = await compile(__dirname)
  const html = template({ language: "en" })
  assert(html.includes('<html lang="en">'))
})

test("layout renders children", async () => {
  const { template } = await compile(__dirname)
  const html = template({ language: "en" }, "Hello, world!")
  assert(html.includes("Hello, world!"))
})
