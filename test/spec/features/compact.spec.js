const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('it minifies html when compact flag is set to true', async assert => {
  const { template } = await compile('<p>This is a <a>boxwood</a> page.</p>', { compact: true })
  assert.deepEqual(template({}, escape), '<p>This is a<a>boxwood</a>page.</p>')
})

test('it does not minify html when compact flag is set to false', async assert => {
  const { template } = await compile('<p>This is a <a>boxwood</a> page.</p>', { compact: false })
  assert.deepEqual(template({}, escape), '<p>This is a <a>boxwood</a> page.</p>')
})
