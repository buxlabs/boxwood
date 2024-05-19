const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/documentation: it returns a page with an accordion", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes("Accordion"))
  assert(html.includes("const sibling = this.nextElement"))
})
