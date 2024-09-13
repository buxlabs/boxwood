const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/landing: it returns a page with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ language: "en" }),
    '<!DOCTYPE html><html lang="en"><head><title>Landing page</title><style>body{background:#ccc;font-family:"Lato"}.button_2{color:red}.button_2:hover{color:blue}</style></head><body><button class="button_2">Bar</button></body></html>'
  )
})
