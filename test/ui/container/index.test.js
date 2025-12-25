const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("renders children", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>foo</div>"))
  assert(html.includes("<div>bar</div>"))
})

test("applies default styles", async () => {
  const { template, css } = await compile(__dirname)
  const html = template()
  assert(html.includes("max-width:1200px;"))
  assert(html.includes("padding-left:16px;"))
  assert(html.includes("padding-right:16px;"))
  assert(html.includes(`@media (max-width:1199px){`))
})

test("applies custom styles", async () => {
  const { template, css } = await compile(__dirname)
  const html = template({ padding: 32, width: 800 })
  assert(html.includes("max-width:800px;"))
  assert(html.includes("padding-left:32px;"))
  assert(html.includes("padding-right:32px;"))
})

test("accepts className and style props", async () => {
  const { template, css } = await compile(__dirname)
  const html = template({
    className: "custom-class",
    style: "background-color:red",
  })
  assert(html.includes("custom-class"))
  assert(html.includes("background-color:red"))
})

test("accepts width as px string", async () => {
  const { template } = await compile(__dirname)
  const html = template({ width: "960px" })
  assert(html.includes("max-width:960px;"))
})

test("accepts width as rem string", async () => {
  const { template } = await compile(__dirname)
  const html = template({ width: "50rem" })
  assert(html.includes("max-width:800px;")) // 50 * 16 = 800
})

test("accepts padding as px string", async () => {
  const { template } = await compile(__dirname)
  const html = template({ padding: "24px" })
  assert(html.includes("padding-left:24px;"))
})

test("accepts padding as rem string", async () => {
  const { template } = await compile(__dirname)
  const html = template({ padding: "2rem" })
  assert(html.includes("padding-left:32px;")) // 2 * 16 = 32
})

test("throws error for invalid width string", async () => {
  const { template } = await compile(__dirname)
  assert.throws(() => {
    template({ width: "100%" })
  }, /Width must be a number or a string ending with 'px' or 'rem'/)
})
