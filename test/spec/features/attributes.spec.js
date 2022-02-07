const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')
const { join } = require('path')

test('attributes: shorthand syntax with one item', async assert => {
  var { template } = await compile('<div class="[foo]"></div>')
  assert.deepEqual(template({}, escape), '<div class=""></div>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '<div class="foo"></div>')
})

test('attributes: shorthand syntax with two items', async assert => {
  var { template } = await compile('<div class="[foo, bar]"></div>')
  assert.deepEqual(template({}, escape), '<div class=""></div>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '<div class="foo"></div>')
  assert.deepEqual(template({ foo: 'foo', bar: 'bar' }, escape), '<div class="foo bar"></div>')
})

test('attributes: shorthand syntax with and operator', async assert => {
  var { template } = await compile(`<div class="[foo && 'bar']"></div>`)
  assert.deepEqual(template({}, escape), '<div class=""></div>')
  assert.deepEqual(template({ foo: true }, escape), '<div class="bar"></div>')
  assert.deepEqual(template({ foo: false }, escape), '<div class=""></div>')
})

test('attributes: shorthand syntax with or operator', async assert => {
  var { template } = await compile(`<div class="[foo || 'bar']"></div>`)
  assert.deepEqual(template({}, escape), '<div class="bar"></div>')
  assert.deepEqual(template({ foo: 'foo' }, escape), '<div class="foo"></div>')
})

test('attributes: shorthand syntax for multiple or operators', async assert => {
  var { template } = await compile('<input id="[id || name]">')
  assert.deepEqual(template({}, escape), '<input id="">')
  assert.deepEqual(template({ id: 'foo' }, escape), '<input id="foo">')
  assert.deepEqual(template({ name: 'foo' }, escape), '<input id="foo">')
  assert.deepEqual(template({ id: 'foo', name: 'bar' }, escape), '<input id="foo">')
})

test('attributes: shorthand syntax with ternary operator', async assert => {
  var { template } = await compile(`<div class="[foo ? 'foo' : 'bar']"></div>`)
  assert.deepEqual(template({}, escape), '<div class="bar"></div>')
  assert.deepEqual(template({ foo: true }, escape), '<div class="foo"></div>')
  assert.deepEqual(template({ foo: false }, escape), '<div class="bar"></div>')
})

test('attributes: shorthand syntax with one string', async assert => {
  var { template } = await compile(`<div class="['foo', bar]"></div>`)
  assert.deepEqual(template({}, escape), '<div class="foo"></div>')
  assert.deepEqual(template({ bar: 'bar' }, escape), '<div class="foo bar"></div>')
})

test('attributes: shorthand syntax with multiple strings', async assert => {
  var { template } = await compile(`<div class="['foo', bar, 'baz']"></div>`)
  assert.deepEqual(template({}, escape), '<div class="foo baz"></div>')
  assert.deepEqual(template({ bar: 'bar' }, escape), '<div class="foo bar baz"></div>')
})

test('attributes: shorthand syntax for passing data to the nested components', async assert => {
  var { template } = await compile(`
    <import layout from="./layout.html"/>
    <layout picture="/foo.jpg"/>
  `, { paths: [join(__dirname, '../../fixtures/attributes/shorthand')] })
  assert.deepEqual(template({}, escape).trim(), '<img src="/foo.jpg">')
})

test('attributes: shorthand syntax for passing data to the nested components with template data', async assert => {
  var { template } = await compile(`
    <import layout from="./layout.html"/>
    <layout {picture}/>
  `, { paths: [join(__dirname, '../../fixtures/attributes/shorthand')] })
  assert.deepEqual(template({ picture: "/foo.jpg" }, escape).trim(), '<img src="/foo.jpg">')
})

test.skip('attributes: shorthand syntax with translations', async assert => {
  var { template } = await compile(`
    <import foo from="./foo.html"/>
    <i18n yaml>
      foo:
      - 'foo'
      - 'foo'
    </i18n>
    <foo foo|translate="foo" />
  `, { languages: ['pl', 'en'], paths: [join(__dirname, '../../fixtures/attributes/shorthand')] })
  assert.deepEqual(template({ language: 'pl' }, escape), 'foo')
})
