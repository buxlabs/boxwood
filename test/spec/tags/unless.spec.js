const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

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

test('unless: true in a curly tag', async assert => {
  const { template } = await compile(`<unless {true}>foo<end>`)
  assert.deepEqual(template({}, escape), '')
})

test('unless: true without a tag', async assert => {
  const { template } = await compile(`<unless true>foo<end>`)
  assert.deepEqual(template({}, escape), '')
})

test('unless: false in a curly tag', async assert => {
  const { template } = await compile(`<unless {false}>foo<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('unless: false without a tag', async assert => {
  const { template } = await compile(`<unless false>foo<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})


test('unless: true in a curly tag with else tag', async assert => {
  const { template } = await compile(`<unless {true}>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'bar')
})

test('unless: true without a tag with else tag', async assert => {
  const { template } = await compile(`<unless true>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'bar')
})

test('unless: false in a curly tag with else tag', async assert => {
  const { template } = await compile(`<unless {false}>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})

test('unless: false without a tag with else tag', async assert => {
  const { template } = await compile(`<unless false>foo<else>bar<end>`)
  assert.deepEqual(template({}, escape), 'foo')
})
