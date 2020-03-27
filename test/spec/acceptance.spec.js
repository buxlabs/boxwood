const test = require('ava')
const compile = require('../helpers/compile')
const { normalize } = require('../helpers/string')
const { join } = require('path')
const { escape } = require('../..')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

test('acceptance: components-in-a-loop', async assert => {
  await suite('components-in-a-loop', assert)
})

test('acceptance: same-attributes', async assert => {
  await suite('same-attributes', assert)
})

test('acceptance: objects-as-parameters', async assert => {
  await suite('objects-as-parameters', assert)
})

test('acceptance: components-with-box-model-attributes', async assert => {
  await suite('components-with-box-model-attributes', assert)
})

test('acceptance: import-multiple-components', async assert => {
  await suite('import-multiple-components', assert)
})

test('acceptance: markdown', async assert => {
  await suite('markdown', assert)
})

test('acceptance: inline-classes', async assert => {
  await suite('inline-classes', assert)
})

test('acceptance: inline in template', async assert => {
  await suite('inline-in-template', assert)
})

test('acceptance: app-page', async assert => {
  await suite('app-page', assert)
})

test('acceptance: tool-page', async assert => {
  await suite('tool-page', assert)
})

test('acceptance: admin-page', async assert => {
  await suite('admin-page', assert)
})

test('acceptance: scoped-styles-are-not-shared', async assert => {
  await suite('scoped-styles-are-not-shared', assert)
})

test('acceptance: scoped-styles-within-slots', async assert => {
  await suite('scoped-styles-within-slots', assert)
})

test('acceptance: slider', async assert => {
  await suite('slider', assert)
})

test('acceptance: calendar', async assert => {
  await suite('calendar', assert)
})

test('acceptance: template-literals', async assert => {
  await suite('template-literals', assert)
})

test('acceptance: event listeners', async assert => {
  await suite('event-listeners', assert)
})

test('acceptance: shorthand-attribute-syntax', async assert => {
  await suite('shorthand-attribute-syntax', assert)
})

test('acceptance: shorthand-attribute-syntax-unused-params', async assert => {
  await suite('shorthand-attribute-syntax-unused-params', assert)
})

test('acceptance: shorthand syntax for conditions', async assert => {
  await suite('shorthand-syntax-for-conditions', assert)
})

test('acceptance: link as a component', async assert => {
  await suite('link-as-component', assert)
})

test('acceptance: pricing-table', async assert => {
  await suite('pricing-table', assert)
})

test('acceptance: component-name-override', async assert => {
  await suite('component-name-override', assert)
})

test('acceptance: relative-paths', async assert => {
  await suite('relative-paths', assert)
})

test.skip('acceptance: slot as a variable', async assert => {
  await suite('slot-as-variable', assert)
})

test.skip('acceptance: variables', async assert => {
  await suite('variables', assert)
})

async function suite (name, assert) {
  const dir = join(__dirname, '../fixtures/acceptance', name)
  const path1 = join(dir, 'actual.html')
  const path2 = join(dir, 'expected.html')
  const path3 = join(dir, 'data.json')
  const content1 = await readFile(path1, 'utf8')
  const content2 = await readFile(path2, 'utf8')
  const content3 = await readFile(path3, 'utf8')
  var { template } = await compile(content1, {
    paths: [dir],
    languages: ['pl', 'en']
  })
  const data = JSON.parse(content3)
  const actual = normalize(template(data, escape))
  const expected = normalize(content2)
  assert.deepEqual(actual, expected)
}
