const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/landing: it returns a page with css", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template({ language: "en" }),
    '<!DOCTYPE html><html lang="en"><head><title>Landing page</title><style>body{background:#ccc;font-family:"Lato"}.__button__1lo7m{color:red}.__button__1lo7m:hover{color:blue}</style></head><body><button class="__button__1lo7m">Bar</button></body></html>'
  )
})
