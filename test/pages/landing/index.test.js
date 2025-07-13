const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/landing: it returns a page with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ language: "en" }),
    '<!DOCTYPE html><html lang="en"><head><title>Landing page</title><style>body{background:#ccc;font-family:"Lato"}.button_1iwkij{color:red}.button_1iwkij:hover{color:blue}</style></head><body><button class="button_1iwkij">Bar</button></body></html>'
  )
})
