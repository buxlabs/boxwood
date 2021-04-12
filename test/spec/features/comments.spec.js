const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('comments: are ignored', async assert => {
  var { template } = await compile('<!-- foo -->')
  assert.deepEqual(template(), '')
})
