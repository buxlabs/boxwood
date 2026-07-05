const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../../..")

test("renders Center component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Centered content"))
  assert(html.includes("<div"))
  assert(!html.includes("&lt;Center&gt;"))
  assert(!html.includes("<Center>"))
})

test("renders Container component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Container content"))
  assert(html.includes("<div"))
  assert(!html.includes("&lt;Container&gt;"))
  assert(!html.includes("<Container>"))
})

test("renders Grid component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Grid content"))
  assert(html.includes("<div"))
  assert(!html.includes("&lt;Grid&gt;"))
  assert(!html.includes("<Grid>"))
})

test("renders Group component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Group content"))
  assert(html.includes("<div"))
  assert(!html.includes("&lt;Group&gt;"))
  assert(!html.includes("<Group>"))
})

test("renders Stack component", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("Stack content"))
  assert(html.includes("<div"))
  assert(!html.includes("&lt;Stack&gt;"))
  assert(!html.includes("<Stack>"))
})

test("renders UI components with variables", async () => {
  const { template } = await compile(__dirname)
  const html = template({ title: "Hello World" })
  assert(html.includes("Hello World"))
  assert(html.includes("<div"))
  assert(!html.includes("{title}"))
})

test("renders img tag with src from array property", async () => {
  const { template } = await compile(__dirname)
  const html = template({ images: [{ src: "/path/to/image.jpg" }] })
  assert(html.includes('src="/path/to/image.jpg"'))
  assert(!html.includes("{images[0].src}"))
})

test("renders Center component with id from object property", async () => {
  const { template } = await compile(__dirname)
  const html = template({ user: { id: "user-123" } })
  assert(html.includes('id="user-123"'))
  assert(html.includes("User Center"))
  assert(!html.includes("{user.id}"))
})

test("renders Container component with id from object property", async () => {
  const { template } = await compile(__dirname)
  const html = template({ container: { id: "main-container" } })
  assert(html.includes('id="main-container"'))
  assert(html.includes("Configured Container"))
  assert(!html.includes("{container.id}"))
})
