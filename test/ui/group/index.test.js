const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("renders children", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>foo</div>"))
  assert(html.includes("<div>bar</div>"))
})

test("has styles", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<style>"))
  assert(html.includes("display:flex"))
  assert(html.includes("</style>"))
})

test('supports "gap" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ gap: "sm" })
  assert(html.includes("gap:0.5rem"))
})

test('supports numeric "gap" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ gap: 40 })
  assert(html.includes("gap:40px"))
})

test('supports "none" gap', async () => {
  const { template } = await compile(__dirname)
  let html = template({ gap: "none" })
  assert(!html.includes("gap:"))
})

test('supports default "gap" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ gap: undefined })
  assert(html.includes("gap:1rem"))
})

test("supports justify prop", async () => {
  const { template } = await compile(__dirname)
  let html = template({ justify: "center" })
  assert(html.includes("justify-content:center"))
})

test("supports align prop", async () => {
  const { template } = await compile(__dirname)
  let html = template({ align: "center" })
  assert(html.includes("align-items:center"))
})

test('supports "start" and "end" values for align and justify props', async () => {
  const { template } = await compile(__dirname)
  let html = template({ align: "start", justify: "end" })
  assert(html.includes("align-items:flex-start"))
  assert(html.includes("justify-content:flex-end"))
})

test('supports undefined "align" and "justify" props', async () => {
  const { template } = await compile(__dirname)
  let html = template({ align: undefined, justify: undefined })
  assert(!html.includes("align-items:"))
  assert(!html.includes("justify-content:"))
})

test("supports style prop", async () => {
  const { template } = await compile(__dirname)
  let html = template({ style: { "background-color": "red" } })
  assert(html.includes("red"))
})

test('supports "width" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ width: "50%" })
  assert(html.includes("width:50%"))
})

test('supports numeric "width" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ width: 300 })
  assert(html.includes("width:300px"))
})

test("supports padding prop", async () => {
  const { template } = await compile(__dirname)
  let html = template({ padding: "md" })
  assert(html.includes("padding:1rem"))
})

test("supports margin prop", async () => {
  const { template } = await compile(__dirname)
  let html = template({ margin: "md" })
  assert(html.includes("margin:1rem"))
})

test('supports numeric "padding" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ padding: 20 })
  assert(html.includes("padding:20px"))
})

test('supports numeric "margin" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ margin: 20 })
  assert(html.includes("margin:20px"))
})

test('supports "breakpoint" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ breakpoint: "767px" })
  assert(html.includes("@media (max-width:767px)"))
})

test('supports numeric "breakpoint" prop', async () => {
  const { template } = await compile(__dirname)
  let html = template({ breakpoint: 1023 })
  assert(html.includes("@media (max-width:1023px)"))
})
