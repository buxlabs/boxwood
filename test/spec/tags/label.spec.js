const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('label: can be used with a for attribute', async assert => {
  var { template } = await compile('<label for="foo">bar</label>')
  assert.deepEqual(template({}, escape), '<label for="foo">bar</label>')
})
