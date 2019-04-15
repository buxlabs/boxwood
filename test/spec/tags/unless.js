import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('switch', async assert => {
  var { template } = await compile('<unless foo>bar</unless>')
  assert.deepEqual(template({ foo: false }, escape), 'bar')

  var { template } = await compile('<unless foo>bar</unless>')
  assert.deepEqual(template({ foo: true }, escape), '')

  var { template } = await compile('<unless foo>bar</unless><else>baz</else>')
  assert.deepEqual(template({ foo: false }, escape), 'bar')

  var { template } = await compile('<unless foo>bar</unless><else>baz</else>')
  assert.deepEqual(template({ foo: true }, escape), 'baz')

  var { template } = await compile('<unless foo>bar</unless><elseif bar>baz</elseif>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), 'baz')

  var { template } = await compile('<unless foo>bar</unless><elseif bar>baz</elseif>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), '')

  var { template } = await compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), 'baz')

  var { template } = await compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: true, bar: false }, escape), 'baz')

  var { template } = await compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: true, bar: true }, escape), '')
})
