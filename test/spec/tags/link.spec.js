const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const escape = require('escape-html')

test('link: inline for css', async assert => {
  var { template } = await compile(`<link href="./foo.css" inline>`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')] })
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }</style>')
})

test('link: global inline for css', async assert => {
  var { template } = await compile(`<link href="./foo.css">`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')], inline: ['stylesheets'] })
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }</style>')
})

test('link: inline for css file that does not exist', async assert => {
  var { template } = await compile(`<link href="./foo.css" inline>`, { paths: [] })
  assert.deepEqual(template({}, escape), '')
})


test('link: can be used as a non self closing tag when imported as component', async assert => {
  var { template } = await compile(`
    <import link from="./link.html" />
    <link href="/foo">bar</link>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape), '<a href="/foo" class="default underlined link">bar</a>')
})

test('link: can be used as a non self closing tag when imported as component (multiple spaces)', async assert => {
  var { template } = await compile(`
    <import   link   from="./link.html" />
    <link href="/foo">bar</link>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape), '<a href="/foo" class="default underlined link">bar</a>')
})
