import test from 'ava'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

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
