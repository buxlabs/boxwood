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

test('compact: it allows to pass a custom compact function', async assert => {
  const { template } = await compile('<p>This is a <a>boxwood</a> page.</p>', {
    compact: value => value.replace('boxwood', 'bw')
  })
  assert.deepEqual(template(), '<p>This is a <a>bw</a> page.</p>')
})

test('compact: it allows to pass an `collapsed` string which removes relevant whitespace', async assert => {
  const { template } = await compile('<p>This is a <a>boxwood</a> page.</p>', { compact: "collapsed" })
  assert.deepEqual(template({}, escape), '<p>This is a<a>boxwood</a>page.</p>')
})
