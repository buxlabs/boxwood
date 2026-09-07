const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#script/load-transform-path: the transform is given the resolved path", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  // The transform built this string out of the path it was handed, so it could
  // only have come from the second argument.
  assert(html.includes('window.entry = "load-transform-path/client.js"'))
  assert(!html.includes("original"))
})

test("#script/load-transform-path: a transform taking only code still works", async () => {
  // The path is a second argument, so every existing one-parameter transform
  // is unaffected.
  const { template } = await compile(
    join(__dirname, "../load-transform/template.js"),
  )

  assert(template().includes("transformed code"))
})
