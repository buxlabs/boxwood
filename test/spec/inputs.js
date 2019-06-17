import test from 'ava'
import compile from '../helpers/compile'
import escape from 'escape-html'

test('input[type=checkbox]', async assert => {
  var { template } = await compile('<input type="checkbox" autofocus>')
  assert.deepEqual(template(), '<input type="checkbox" autofocus>')

  var { template } = await compile('<input type="checkbox" readonly>')
  assert.deepEqual(template(), '<input type="checkbox" readonly>')

  var { template } = await compile('<input type="checkbox" disabled>')
  assert.deepEqual(template(), '<input type="checkbox" disabled>')

  var { template } = await compile('<input type="checkbox" formnovalidate>')
  assert.deepEqual(template(), '<input type="checkbox" formnovalidate>')

  var { template } = await compile('<input type="checkbox" multiple>')
  assert.deepEqual(template(), '<input type="checkbox" multiple>')

  var { template } = await compile('<input type="checkbox" required>')
  assert.deepEqual(template(), '<input type="checkbox" required>')

  var { template } = await compile('<input type="checkbox">')
  assert.deepEqual(template(), '<input type="checkbox">')

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
  assert.deepEqual(template(), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: true }), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked="{foo}">')
  assert.deepEqual(template({ foo: false }), '<input type="checkbox">')

  var { template } = await compile('<input type="checkbox" checked|bind="foo">')
  assert.deepEqual(template({ foo: true }, escape), '<input type="checkbox" checked>')

  var { template } = await compile('<input type="checkbox" checked|bind="foo">')
  assert.deepEqual(template({ foo: false }, escape), '<input type="checkbox">')
})
