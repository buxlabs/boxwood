const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("attributes: handles null and undefined", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("<div>No attrs</div>"))
  assert(html.includes("<div>No attrs 2</div>"))
})

test("attributes: filters invalid style keys", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  assert(html.includes("color:red"))
  assert(!html.includes("invalid-key!"))
})

test("attributes: accepts namespaced attributes with colons", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  // Test xml:lang namespace
  assert(html.includes('xml:lang="en"'), "Should include xml:lang attribute")
  // Test xmlns:xlink namespace declaration
  assert(
    html.includes('xmlns:xlink="http://www.w3.org/1999/xlink"'),
    "Should include xmlns:xlink attribute",
  )
  // Test xlink:href attribute
  assert(
    html.includes('xlink:href="#icon"'),
    "Should include xlink:href attribute",
  )
  // Verify data attributes still work
  assert(
    html.includes('data-test="value"'),
    "Should include data-test attribute",
  )
})

test("attributes: filters out invalid characters while allowing colons", async () => {
  const { template } = await compile(__dirname)
  const html = template()
  // Valid attributes with hyphens should be included
  assert(
    html.includes('valid-attr="ok"'),
    "Should include valid-attr attribute",
  )
  // Invalid attributes with @ and ! should be filtered
  assert(
    !html.includes("invalid@attr"),
    "Should not include attributes with @ character",
  )
  assert(
    !html.includes("invalid!key"),
    "Should not include attributes with ! character",
  )
})
