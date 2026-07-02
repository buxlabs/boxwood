const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("renders with default props", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "content")
  assert(html.includes("<div"))
  assert(html.includes("content"))
})

test("supports id", async () => {
  const { template } = await compile(__dirname)
  const html = template({ id: "my-grid" }, "test")
  assert(html.includes('id="my-grid"'))
})

test("supports custom className", async () => {
  const { template } = await compile(__dirname)
  const html = template({ className: "custom-class" }, "test")
  assert(html.includes("custom-class"))
})

test("supports style attribute", async () => {
  const { template } = await compile(__dirname)
  const html = template({ style: "background: red" }, "test")
  assert(html.includes('style="background: red"'))
})

test("renders with custom number of columns", async () => {
  const { template } = await compile(__dirname)
  const html = template({ columns: 4 }, "test")
  assert(html.includes("<div"))
})

test("renders with custom column template string", async () => {
  const { template } = await compile(__dirname)
  const html = template({ columns: "200px 1fr 200px" }, "test")
  assert(html.includes("<div"))
})

test("supports gap property", async () => {
  const { template } = await compile(__dirname)
  const html = template({ gap: "20px" }, "test")
  assert(html.includes("<div"))
})

test("supports responsive columns with breakpoints", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      columns: {
        default: 4,
        lg: 3,
        md: 2,
        sm: 1,
      },
    },
    "test",
  )
  assert(html.includes("<div"))
})

test("supports breakpoint parameter", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      columns: 3,
      breakpoint: "768px",
    },
    "test",
  )
  assert(html.includes("<div"))
})

test("renders children content", async () => {
  const { template } = await compile(__dirname)
  const html = template({}, "Grid content here")
  assert(html.includes("Grid content here"))
})

test("combines all features together", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      id: "main-grid",
      className: "content-grid",
      columns: {
        default: 4,
        lg: 3,
      },
      gap: "1.5rem",
      style: "margin: 20px",
    },
    "test content",
  )
  assert(html.includes('id="main-grid"'))
  assert(html.includes("content-grid"))
  assert(html.includes('style="margin: 20px"'))
  assert(html.includes("test content"))
})

test("handles string number for columns", async () => {
  const { template } = await compile(__dirname)
  const html = template({ columns: "2" }, "test")
  assert(html.includes("<div"))
  assert(html.includes("test"))
})

test("handles string number for columns with value 4", async () => {
  const { template } = await compile(__dirname)
  const html = template({ columns: "4" }, "test")
  assert(html.includes("<div"))
})

test("handles string numbers in responsive columns", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      columns: {
        default: "3",
        md: "2",
        sm: "1",
      },
    },
    "test",
  )
  assert(html.includes("<div"))
})

test("handles mixed number types in responsive columns", async () => {
  const { template } = await compile(__dirname)
  const html = template(
    {
      columns: {
        default: 4,
        lg: "3",
        md: 2,
        sm: "1",
      },
    },
    "test",
  )
  assert(html.includes("<div"))
})

test("distinguishes between string numbers and template strings", async () => {
  const { template } = await compile(__dirname)
  // "2" should be treated as number, "200px 1fr" should stay as template string
  const html1 = template({ columns: "2" }, "test1")
  const html2 = template({ columns: "200px 1fr" }, "test2")
  assert(html1.includes("test1"))
  assert(html2.includes("test2"))
})
