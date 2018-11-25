import test from '../../helpers/test'
import compile from '../../helpers/compile'

test('switch', async assert => {
  let template

  template = await compile('<unless foo>bar</unless>')
  assert.deepEqual(template({ foo: false }, html => html), 'bar')

  template = await compile('<unless foo>bar</unless>')
  assert.deepEqual(template({ foo: true }, html => html), '')

  template = await compile('<unless foo>bar</unless><else>baz</else>')
  assert.deepEqual(template({ foo: false }, html => html), 'bar')

  template = await compile('<unless foo>bar</unless><else>baz</else>')
  assert.deepEqual(template({ foo: true }, html => html), 'baz')

  template = await compile('<unless foo>bar</unless><elseif bar>baz</elseif>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), 'baz')

  template = await compile('<unless foo>bar</unless><elseif bar>baz</elseif>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), '')

  template = await compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), 'baz')

  template = await compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: true, bar: false }, html => html), 'baz')

  template = await compile('<unless foo>bar</unless><elseunless bar>baz</elseunless>')
  assert.deepEqual(template({ foo: true, bar: true }, html => html), '')
})
