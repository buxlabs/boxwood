const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('compact: when compact flag is set to true it minifies html and preserves relevant whitespace', async assert => {
  const { template } = await compile('<p>This is a <a>boxwood</a> page.</p>', { compact: true })
  assert.deepEqual(template({}, escape), '<p>This is a <a>boxwood</a> page.</p>')
})

test('compact: when compact flag is set to false it does not minify html', async assert => {
  const { template } = await compile('<p>This is a <a>boxwood</a> page.</p>', { compact: false })
  assert.deepEqual(template({}, escape), '<p>This is a <a>boxwood</a> page.</p>')
})
