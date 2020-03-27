const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('space: it renders space', async assert => {
  var { template } = await compile(`foo<space>bar`)
  assert.deepEqual(template({}, escape), 'foo bar')

  var { template } = await compile(`foo<space/>bar<space/>baz`)
  assert.deepEqual(template({}, escape), 'foo bar baz')

  var { template } = await compile(`foo<space repeat="{2}">bar`)
  assert.deepEqual(template({}, escape), 'foo  bar')  
})
