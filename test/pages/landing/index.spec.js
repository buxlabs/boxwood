const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#pages/landing: it returns a page with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(
    template(),
    '<!DOCTYPE html><html><head><title>Landing page</title><style>body{background:#ccc;font-family:"Lato"}.__button__ht6dr{color:red}.__button__ht6dr:hover{color:blue}</style></head><body><button class="__button__ht6dr">Sign In</button><button class="__button__ht6dr">Sign Up</button></body></html>'
  )
})
