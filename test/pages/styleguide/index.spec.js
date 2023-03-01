const test = require("ava")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/styleguide: it returns a page with css", async (assert) => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template({ language: "pl" })
  assert.truthy(
    html.includes(
      "@media only screen and (max-width:767px){.__sidebar__ake0o{display:none}}"
    )
  )
  assert.falsy(html.includes("undefined"))
  assert.truthy(html.includes("Hej"))
})
