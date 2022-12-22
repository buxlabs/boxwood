const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#pages/styleguide: it returns a page with css', async assert => {
  const { template } = await compile(join(__dirname, './index.js'))
  assert.truthy(template().includes('@media only screen and (max-width:767px){.__sidebar__1upp6{display:none}}'))
  assert.falsy(template().includes('undefined'))
})
