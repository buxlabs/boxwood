const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/input: it returns a component with truthy attributes", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ placeholder: "Search" }),
    '<input placeholder="Search">'
  )
})
