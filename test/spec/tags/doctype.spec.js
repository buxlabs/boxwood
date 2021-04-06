const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('basic: it handles doctype', async assert => {
  var { template } = await compile('<!DOCTYPE html>')
  assert.deepEqual(template(), '<!DOCTYPE html>')
})
