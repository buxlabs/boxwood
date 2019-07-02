import test from 'ava'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('partial', async assert => {
  var { template } = await compile(`<partial from="./terms.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo bar baz</div>')

  var { template } = await compile(`<partial from="./footer.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}), '<div>foo</div><footer>bar</footer>')

  var { template } = await compile(`<partial from="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  var { template } = await compile(`<partial from="./header.html">`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')

  var { template } = await compile(`<partial from="./header.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({ title: 'foo' }, escape), '<div>foo</div>')
})

test('partial: can import components', async assert => {
  const { template } = await compile(`<partial from="./newsletter.html" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial') ]
  })
  assert.deepEqual(template({}, escape), '<form class="ui form"><button class="btn primary">foo</button></form>')
})

test('partial: passes attributes', async assert => {
  const { template } = await compile(`<partial from="./foo.html" bar="qux" baz="quux" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/attributes') ]
  })
  assert.deepEqual(template({}, escape), 'quxquux')
})
