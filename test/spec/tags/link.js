import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('link: inline for css', async assert => {
  const template = await compile(`<link href="./foo.css" inline>`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')] })
  assert.deepEqual(template({}, escape), '<style>.foo { color: red; }\n</style>')
})

test('link: global inline for css', async assert => {
  const template = await compile(`<link href="./foo.css">`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')], inline: ['stylesheets'] })
  assert.deepEqual(template({}, escape), `<style>.foo { color: red; }\n</style>`)
})
