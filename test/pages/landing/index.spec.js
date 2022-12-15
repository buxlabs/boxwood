const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#pages/landing: it returns a page with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(
    template(),
    '<!DOCTYPE html><html><head><title>Landing page</title><style>body{background:#ccc}.__button__jhy66{color:red}.__button__jhy66:hover{color:blue}</style></head><body><button class="__button__jhy66">Hello, world!</button></body></html>'
  )
})
