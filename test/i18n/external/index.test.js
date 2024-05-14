const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("i18n is going to throw when key is undefined", async () => {
  const { template } = await compile(__dirname)
  const html = template({ language: "en" })
  assert(html.includes("<div>bar</div>"))
})
