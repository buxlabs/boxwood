import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('link: inline for css', async assert => {
  const template = await compile(`<link href="./foo.css" inline>`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')] })
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }</style>')
})

test('link: global inline for css', async assert => {
  const template = await compile(`<link href="./foo.css">`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')], inline: ['stylesheets'] })
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }</style>')
})

test('link: can be used as a non self closing tag when imported as component', async assert => {
  const template = await compile(`
    <import link from="./link.html" />
    <link href="/foo">bar</link>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape), '<a href="/foo" class="default underlined link">bar</a>')
})

test('link: can be used as a non self closing tag when imported as component (multiple spaces)', async assert => {
  const template = await compile(`
    <import   link   from="./link.html" />
    <link href="/foo">bar</link>
  `, {
    paths: [ path.join(__dirname, '../../fixtures/components') ]
  })
  assert.deepEqual(template({}, escape), '<a href="/foo" class="default underlined link">bar</a>')
})
