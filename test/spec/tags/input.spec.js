const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const { escape } = require('../../..')

test('input: can be used as a non self closing tag when imported as component', async assert => {
  var { template } = await compile(`
    <import input from="./input.html" />
    <input name="foo"/>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape).trim(), '<input name="foo" type="text">')
})

test('input: can be used as a non self closing tag when imported as component (multiple spaces', async assert => {
  var { template } = await compile(`
    <import   input   from="./input.html" />
    <input name="foo"/>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape).trim(), '<input name="foo" type="text">')
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
})

test('input[type=checkbox][checked]', async assert => {
  var { template } = await compile('<input type="checkbox" checked>')
  assert.deepEqual(template({}, escape), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')
})
