const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/landing: it returns a page with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ language: "en" }),
    '<!DOCTYPE html><html lang="en"><head><title>Landing page</title><style>body{background:#ccc;font-family:"Lato"}.c1{color:red}.c1:hover{color:blue}</style></head><body><button class="c1">Bar</button></body></html>'
  )
})
