const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/styleguide: it returns a page with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template({ language: "pl" })
  assert(
    html.includes(
      "@media only screen and (max-width:767px){.sidebar_ake0o{display:none}}"
    )
  )
  assert(!html.includes("undefined"))
  assert(html.includes("Hej"))
})
