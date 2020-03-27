const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('markdown', async assert => {
  var { template } = await compile('<markdown># foo</markdown>')
  assert.deepEqual(template({}, escape), '<h1 id="foo">foo</h1>')
})
