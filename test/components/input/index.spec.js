const test = require('ava')
const { join } = require('path')
const { compile } = require('../../..')

test('#components/input: it returns a component with truthy attributes', async (assert) => {
  const { template } = await compile(join(__dirname, './index.js'))

  assert.deepEqual(template({ placeholder: 'Search' }), '<input placeholder="Search">')
})
