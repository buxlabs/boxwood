const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const escape = require('escape-html')

test('input: can be used as a non self closing tag when imported as component', async assert => {
  var { template } = await compile(`
    <import input from="./input.html" />
    <input name="foo"/>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape), '<input name="foo" type="text">')
})

test('input: can be used as a non self closing tag when imported as component (multiple spaces', async assert => {
  var { template } = await compile(`
    <import   input   from="./input.html" />
    <input name="foo"/>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape), '<input name="foo" type="text">')
})

test('input[type=checkbox]', async assert => {
  var { template } = await compile('<input type="checkbox" autofocus>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" autofocus>')

  var { template } = await compile('<input type="checkbox" readonly>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" readonly>')

  var { template } = await compile('<input type="checkbox" disabled>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" disabled>')

  var { template } = await compile('<input type="checkbox" formnovalidate>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" formnovalidate>')

  var { template } = await compile('<input type="checkbox" multiple>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" multiple>')

  var { template } = await compile('<input type="checkbox" required>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" required>')

  var { template } = await compile('<input type="checkbox">')
  assert.deepEqual(template({}, escape), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" readonly|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" readonly>')

  var { template } = await compile('<input type="checkbox" readonly|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" disabled|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" disabled>')

  var { template } = await compile('<input type="checkbox" disabled|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" autofocus|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" autofocus>')

  var { template } = await compile('<input type="checkbox" autofocus|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" formnovalidate|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" formnovalidate>')

  var { template } = await compile('<input type="checkbox" formnovalidate|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" multiple|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" multiple>')

  var { template } = await compile('<input type="checkbox" multiple|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" required|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" required>')

  var { template } = await compile('<input type="checkbox" required|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')
})

test('input[type=checkbox][checked]', async assert => {
  var { template } = await compile('<input type="checkbox" checked>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" checked|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')
})
