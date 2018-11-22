import test from 'ava'
import compile from '../../helpers/compile'
import path from 'path'

test('import', async assert => {
  let template

  template = await compile(`
    <import layout from="./layouts/blank3.html">
    <layout>foo</layout>
  `, { paths: [ path.join(__dirname, '../../fixtures') ]})

  assert.deepEqual(template({}, html => html), `foo<footer>bar</footer>`)

})
