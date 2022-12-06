const test = require('ava')
const { join } = require('path')
const { compile } = require('../../../../..')

test('#pages/landing: it returns a page with css', async assert => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(template(), '<html><head><title>Landing page</title><style>body { background: #ccc; }</style></head><body>Hello, world!</body></html>')
})
