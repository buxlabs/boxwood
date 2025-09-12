const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("renders children", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>foo</div>"))
  assert(html.includes("<div>bar</div>"))
})

test("applies className", async () => {
  const { template } = await compile(__dirname)
  const html = template({ className: "custom-class" })
  assert(html.includes("custom-class"))
})

test("applies style", async () => {
  const { template } = await compile(__dirname)
  const html = template({ style: { backgroundColor: "red" } })
  assert(html.includes('style="background-color:red"'))
})

test("applies columns as number", async () => {
  const { template } = await compile(__dirname)
  const html = template({ columns: 4 })
  console.log(html)
  assert(html.includes("grid-template-columns:repeat(4,1fr)"))
})

test("applies columns as string", async () => {
  const { template } = await compile(__dirname)
  const html = template({ columns: "1fr 2fr 1fr" })
  assert(html.includes("grid-template-columns:1fr 2fr 1fr"))
})

test("applies columns as object", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    columns: {
      default: "1fr",
      600: "1fr 1fr",
      900: "1fr 1fr 1fr",
    },
  })
  assert(html.includes("grid-template-columns:1fr"))
  assert(html.includes("@media (min-width:600px)"))
  assert(html.includes("grid-template-columns:1fr 1fr"))
  assert(html.includes("@media (min-width:900px)"))
  assert(html.includes("grid-template-columns:1fr 1fr 1fr"))
})

test("applies gap", async () => {
  const { template } = await compile(__dirname)
  const html = template({ gap: "16px" })
  assert(html.includes("gap:16px"))
})
