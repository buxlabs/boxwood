import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('partial', async assert => {
  let template

  template = await compile(`<partial from="./terms.html"></partial>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo bar baz</div>')

  template = await compile(`<partial from="./footer.html"></partial>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><footer>bar</footer>')

  template = await compile(`<partial from="./header.html"></partial>`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<partial from="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<partial from="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  await assert.throws(
    compile(`<partial from='./partial.html'/><partial>`, {}),
    /Compiler option is undefined: paths\./
  )

  await assert.throws(
    compile(`<partial from='./partial.html'/><partial>`, { paths: [] }),
    /Asset not found: \.\/partial\.html/
  )
})

test.skip('partial: can import components', async assert => {
  const template = await compile(`<partial from="./newsletter.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<form class="ui form"><button class="btn primary">foo</button></form>')
})

