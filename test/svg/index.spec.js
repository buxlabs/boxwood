const test = require('ava')
const { join } = require('path')
const { compile } = require('../..')

test('#svg: it returns an svg', async assert => {
  const { template } = await compile(join(__dirname, './index.js'))
  assert.truthy(template().includes('<line x1="0" y1="10" x2="10" y2="0" stroke="black" />'))
  assert.truthy(template().includes('<svg><rect></rect></svg>'))
})
