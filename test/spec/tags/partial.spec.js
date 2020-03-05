const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const escape = require('escape-html')

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

test('partial: passes attributes and handles expressions', async assert => {
  const { template } = await compile(`<partial from="./bar.html" foo qux="{qux}" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/attributes') ]
  })
  assert.deepEqual(template({
    qux: (quux) => quux,
    quux: "quux"
  }, escape), '<a class="bar" href="quuxquuux"></a>')
})

test('partial: passes attributes for reserved keywords and a curly tag in the end', async assert => {
  const { template } = await compile(`<partial from="./foo.html" type="fluid" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/keywords') ]
  })
  assert.deepEqual(template({}, escape), '<div class="container-fluid">foo</div>')
})

test('partial: passes attributes for reserved keywords and a curly tag in the beginning', async assert => {
  const { template } = await compile(`<partial from="./footer.html" type="fluid" style="position:absolute; width: 100%;" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/keywords') ]
  })
  assert.deepEqual(template({}, escape), '<footer class="fluid gray background" style="position:absolute; width: 100%;"></footer>')
})

test('partial: passes attributes and works for multiple curly tags in one value', async assert => {
  const { template } = await compile(`<partial from="./complex.html" color="black" font="big" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/keywords') ]
  })
  assert.deepEqual(template({}, escape), '<div class="color-black font-big">foo</div>')
})

test('partial: passes attributes and works for multiple curly tags one after another in one value', async assert => {
  const { template } = await compile(`<partial from="./bar.html" class="bank" typeof="ster" />`, {
    paths: [ path.join(__dirname, '../../fixtures/partial/keywords') ]
  })
  assert.deepEqual(template({}, escape), '<div class="bankster">foo</div>')
})

test('partial: template literals in the imported component', async assert => {
  const { template } = await compile('<partial from="./bar.html" foo="baz"/>', {
    paths: [
      path.join(__dirname, '../../fixtures/import/template-literals')
    ]
  })
  assert.deepEqual(template({}, escape), '<div class="foo-baz"></div><div class="foo-baz"></div>')
})
