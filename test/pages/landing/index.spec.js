const test = require("ava")
const { join } = require("path")
const { compile } = require("../../..")

test("#pages/landing: it returns a page with css", async (assert) => {
  const { template } = await compile(join(__dirname, "./index.js"))

  assert.deepEqual(
    template(),
    '<!DOCTYPE html><html><head><title>Landing page</title><style>body{background:#ccc;font-family:"Lato"}.__button__1lo7m{color:red}.__button__1lo7m:hover{color:blue}</style></head><body><button class="__button__1lo7m">Foo</button><button class="__button__1lo7m">Bar</button></body></html>'
  )
})
