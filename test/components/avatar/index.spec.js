const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#components/avatar: it returns a component with css', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.truthy(template({ image: 'https://images.com/cat.png' }).includes('cat.png'))
  assert.truthy(template({ text: 'foo' }).includes('foo'))
})
