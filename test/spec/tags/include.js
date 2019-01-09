import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('partial', async assert => {
  let template

  template = await compile(`<include partial="./terms.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo bar baz</div>')

  template = await compile(`<include partial="./footer.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><footer>bar</footer>')

  template = await compile(`<include partial="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<include partial="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  template = await compile(`<include partial="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  await assert.throwsAsync(
    compile(`<include partial='./partial.html' />`, {}),
    /Compiler option is undefined: paths\./
  )

  await assert.throwsAsync(
    compile(`<include partial='./partial.html' />`, { paths: [] }),
    /Asset not found: \.\/partial\.html/
  )
})

test('include: can import components', async assert => {
  const template = await compile(`<include partial="./newsletter.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<form class="ui form"><button class="btn primary">foo</button></form>')
})
