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

test("applies columns as object with numbers and default key", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    columns: {
      default: "1fr 1fr 1fr 1fr",
      1023: "1fr 1fr",
      767: "1fr",
    },
  })
  assert(html.includes("grid-template-columns:1fr 1fr 1fr 1fr"))
  assert(html.includes("@media (max-width:1023px)"))
  assert(html.includes("grid-template-columns:1fr 1fr"))
  assert(html.includes("@media (max-width:767px)"))
  assert(html.includes("grid-template-columns:1fr"))
})

test("applies columns as object with strings and default key", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    columns: {
      default: "1fr 1fr 1fr 1fr",
      "1023px": "1fr 1fr",
      "767px": "1fr",
    },
  })
  assert(html.includes("grid-template-columns:1fr 1fr 1fr 1fr"))
  assert(html.includes("@media (max-width:1023px)"))
  assert(html.includes("grid-template-columns:1fr 1fr"))
  assert(html.includes("@media (max-width:767px)"))
  assert(html.includes("grid-template-columns:1fr"))
})

test("applies columns as object with strings and default key", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    columns: {
      default: "1fr 1fr 1fr 1fr",
      "1023px": "1fr 1fr",
      "767px": "1fr",
    },
  })
  assert(html.includes("grid-template-columns:1fr 1fr 1fr 1fr"))
  assert(html.includes("@media (max-width:1023px)"))
  assert(html.includes("grid-template-columns:1fr 1fr"))
  assert(html.includes("@media (max-width:767px)"))
  assert(html.includes("grid-template-columns:1fr"))
})

test("applies columns as object with string as breakpoints and default key", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    columns: {
      default: "1fr 1fr 1fr 1fr",
      lg: "1fr 1fr",
      md: "1fr",
    },
  })
  assert(html.includes("grid-template-columns:1fr 1fr 1fr 1fr"))
  assert(html.includes("@media (max-width:1023px)"))
  assert(html.includes("grid-template-columns:1fr 1fr"))
  assert(html.includes("@media (max-width:767px)"))
  assert(html.includes("grid-template-columns:1fr"))
})

test("applies gap", async () => {
  const { template } = await compile(__dirname)
  const html = template({ gap: "16px" })
  assert(html.includes("gap:16px"))
})
