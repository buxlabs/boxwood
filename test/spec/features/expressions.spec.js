const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('expressions: it handles variables', async assert => {
  var { template } = await compile('{foo}')
  assert.deepEqual(template({ foo: 'foo' }, escape), 'foo')
})
