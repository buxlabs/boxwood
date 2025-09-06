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
