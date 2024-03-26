const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#components/avatar: it returns a component with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert(template({ image: "https://images.com/cat.png" }).includes("cat.png"))
  assert(template({ text: "foo" }).includes("foo"))
})
