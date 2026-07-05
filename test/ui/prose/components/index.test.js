const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../../..")

test("renders Center component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Centered content"))
})

test("renders Container component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Container content"))
})

test("renders Grid component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Grid content"))
})

test("renders Group component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Group content"))
})

test("renders Stack component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Stack content"))
})

test("renders UI components with variables", async () => {
  const { template } = await compile(__dirname)
  const html = template({ title: "Hello World" })
  assert(html.includes("Hello World"))
})
