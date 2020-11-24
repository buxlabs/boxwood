const test = require('ava')
const path = require('path')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('globals: Math', async assert => {
  var { template } = await compile('{Math.abs(foo)}')
  assert.deepEqual(template({ foo: -1 }, escape), '1')

  var { template } = await compile('{Math.ceil(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, escape), '2')

  var { template } = await compile('{Math.floor(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, escape), '1')

  var { template } = await compile('{Math.round(foo)}')
  assert.deepEqual(template({ foo: 1.4 }, escape), '1')

  var { template } = await compile('{Math.round(foo)}')
  assert.deepEqual(template({ foo: 1.6 }, escape), '2')

  var { template } = await compile('{Math.pow(foo, 3)}')
  assert.deepEqual(template({ foo: 2 }, escape), '8')
})

test('globals: Number', async assert => {
  var { template } = await compile('{Number.isFinite(foo)}')
  assert.deepEqual(template({ foo: 42 }, escape), 'true')

  var { template } = await compile('{Number.isFinite(foo)}')
  assert.deepEqual(template({ foo: Infinity }, escape), 'false')
})

test('globals: JSON', async assert => {
  var { template } = await compile('{JSON.stringify(foo, null, 2)}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n  &quot;bar&quot;: &quot;baz&quot;\n}')

  var { template } = await compile('{JSON.stringify(foo, null, 4)}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n    &quot;bar&quot;: &quot;baz&quot;\n}')
})

test('globals: Date', async assert => {
  var { template } = await compile('{Date.parse("01 Jan 1970 00:00:00 GMT")}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '0')

  var { template } = await compile('{Date.parse("04 Dec 1995 00:12:00 GMT")}')
  assert.deepEqual(template({}, escape), '818035920000')
})

test('globals: implicit variables', async assert => {
  var { template } = await compile('{globals.foo} {globals["foo"]}')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'bar bar')

  var { template } = await compile('{globals.foo.bar}')
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), 'baz')

  var { template } = await compile('<for bar in globals.foo>{bar}</for>')
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '123')

  var { template } = await compile('<if globals.foo>foo<end>')
  assert.deepEqual(template({ foo: true }, escape), 'foo')
})

test('globals: inside of call expressions', async assert => {
  const { template } = await compile(`
    {route(globals.page)}
  `)
  assert.deepEqual(
    template({
      route(page) { return page + 'bar' },
      page: 'foo'
    }, escape),
    'foobar'
  )
})

test('globals: inside of imported components', async assert => {
  const { template } = await compile(`
    <import foo from="./foo.html"/>
    <foo {route} />
  `, {
    paths: [path.join(__dirname, '../../fixtures/globals')]
  })
  assert.deepEqual(
    template({
      route(page) { return page + 'bar' },
      page: 'foo'
    }, escape),
    '<a href="foobar">baz</a>'
  )
})
