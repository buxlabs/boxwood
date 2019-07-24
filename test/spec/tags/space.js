import test from 'ava'
import compile from '../../helpers/compile'

test('space: it renders space', async assert => {
  var { template } = await compile(`foo<space>bar`)
  assert.deepEqual(template({}), 'foo bar')

  var { template } = await compile(`foo<space/>bar<space/>baz`)
  assert.deepEqual(template({}), 'foo bar baz')

  var { template } = await compile(`foo<space repeat="{2}">bar`)
  assert.deepEqual(template({}), 'foo  bar')  
})