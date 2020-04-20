const test = require('ava')
const compile = require('../helpers/compile')
const { normalize } = require('../helpers/string')
const { join } = require('path')
const { escape } = require('../..')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

test('acceptance: components-in-a-loop', async assert => {
  const { actual, expected } = await suite('components-in-a-loop')
  assert.deepEqual(actual, expected)
})

test('acceptance: same-attributes', async assert => {
  const { actual, expected } = await suite('same-attributes')
  assert.deepEqual(actual, expected)
})

test('acceptance: objects-as-parameters', async assert => {
  const { actual, expected } = await suite('objects-as-parameters')
  assert.deepEqual(actual, expected)
})

test('acceptance: components-with-box-model-attributes', async assert => {
  const { actual, expected } = await suite('components-with-box-model-attributes')
  assert.deepEqual(actual, expected)
})

test('acceptance: import-multiple-components', async assert => {
  const { actual, expected } = await suite('import-multiple-components')
  assert.deepEqual(actual, expected)
})

test('acceptance: markdown', async assert => {
  const { actual, expected } = await suite('markdown')
  assert.deepEqual(actual, expected)
})

test('acceptance: inline-classes', async assert => {
  const { actual, expected } = await suite('inline-classes')
  assert.deepEqual(actual, expected)
})

test('acceptance: inline in template', async assert => {
  const { actual, expected } = await suite('inline-in-template')
  assert.deepEqual(actual, expected)
})

test('acceptance: app-page', async assert => {
  const { actual, expected } = await suite('app-page')
  assert.deepEqual(actual, expected)
})

test('acceptance: tool-page', async assert => {
  const { actual, expected } = await suite('tool-page')
  assert.deepEqual(actual, expected)
})

test('acceptance: admin-page', async assert => {
  const { actual, expected } = await suite('admin-page')
  assert.deepEqual(actual, expected)
})

test('acceptance: scoped-styles-are-not-shared', async assert => {
  const { actual, expected } = await suite('scoped-styles-are-not-shared')
  assert.deepEqual(actual, expected)
})

test('acceptance: scoped-styles-within-slots', async assert => {
  const { actual, expected } = await suite('scoped-styles-within-slots')
  assert.deepEqual(actual, expected)
})

test('acceptance: slider', async assert => {
  const { actual, expected } = await suite('slider')
  assert.deepEqual(actual, expected)
})

test('acceptance: calendar', async assert => {
  const { actual, expected } = await suite('calendar')
  assert.deepEqual(actual, expected)
})

test('acceptance: template-literals', async assert => {
  const { actual, expected } = await suite('template-literals')
  assert.deepEqual(actual, expected)
})

test('acceptance: event listeners', async assert => {
  const { actual, expected } = await suite('event-listeners')
  assert.deepEqual(actual, expected)
})

test.skip('acceptance: shorthand-attribute-syntax', async assert => {
  const { actual, expected } = await suite('shorthand-attribute-syntax')
  assert.deepEqual(actual, expected)
})

test('acceptance: shorthand-attribute-syntax-unused-params', async assert => {
  const { actual, expected } = await suite('shorthand-attribute-syntax-unused-params')
  assert.deepEqual(actual, expected)
})

test('acceptance: shorthand syntax for conditions', async assert => {
  const { actual, expected } = await suite('shorthand-syntax-for-conditions')
  assert.deepEqual(actual, expected)
})

test('acceptance: link as a component', async assert => {
  const { actual, expected } = await suite('link-as-component')
  assert.deepEqual(actual, expected)
})

test('acceptance: pricing-table', async assert => {
  const { actual, expected } = await suite('pricing-table')
  assert.deepEqual(actual, expected)
})

test('acceptance: component-name-override', async assert => {
  const { actual, expected } = await suite('component-name-override')
  assert.deepEqual(actual, expected)
})

test('acceptance: relative-paths', async assert => {
  const { actual, expected } = await suite('relative-paths')
  assert.deepEqual(actual, expected)
})

test('acceptance: implicit-variables', async assert => {
  const { actual } = await suite('implicit-variables')
  assert.truthy(actual.includes('TypeError: Cannot read property \'name\' of undefined'))
})

test('acceptance: explicit-variables', async assert => {
  const { actual, expected } = await suite('explicit-variables')
  assert.deepEqual(actual, expected)
})

test('acceptance: globals', async assert => {
  const { actual, expected } = await suite('globals')
  assert.deepEqual(actual, expected)
})

test('acceptance: globals-env', async assert => {
  const { actual, expected } = await suite('globals-env')
  assert.deepEqual(actual, expected)
})

test('acceptance: static-page', async assert => {
  const { actual, expected } = await suite('static-page')
  assert.deepEqual(actual, expected)
})

test('acceptance: styleguide', async assert => {
  const { actual, expected } = await suite('styleguide')
  assert.deepEqual(actual, expected)
})

test('acceptance: invoice', async assert => {
  const { actual, expected } = await suite('invoice', { compact: false })
  assert.deepEqual(actual, expected)
})

test('acceptance: data', async assert => {
  const { actual, expected } = await suite('data')
  assert.deepEqual(actual, expected)
})

test('acceptance: nested-slots-2-levels', async assert => {
  const { actual, expected } = await suite('nested-slots-2-levels')
  assert.deepEqual(actual, expected)
})

test('acceptance: nested-slots-3-levels', async assert => {
  const { actual, expected } = await suite('nested-slots-3-levels')
  assert.deepEqual(actual, expected)
})

test('acceptance: nested-slots-4-levels', async assert => {
  const { actual, expected } = await suite('nested-slots-4-levels')
  assert.deepEqual(actual, expected)
})

test.skip('acceptance: slot as a variable', async assert => {
  const { actual, expected } = await suite('slot-as-variable')
  assert.deepEqual(actual, expected)
})

test.skip('acceptance: variables', async assert => {
  const { actual, expected } = await suite('variables')
  assert.deepEqual(actual, expected)
})

async function suite (name, compilerOptions = {}) {
  const dir = join(__dirname, '../fixtures/acceptance', name)
  const path1 = join(dir, 'actual.html')
  const path2 = join(dir, 'expected.html')
  const path3 = join(dir, 'data.json')
  const content1 = await readFile(path1, 'utf8')
  const content2 = await readFile(path2, 'utf8')
  const content3 = await readFile(path3, 'utf8')
  const { template, warnings, errors } = await compile(content1, {
    paths: [dir],
    languages: ['pl', 'en'],
    ...compilerOptions
  })
  const data = JSON.parse(content3)
  let actual = ''
  try {
    actual = normalize(template(data, escape))
  } catch (exception) {
    actual = exception.stack
  }
  const expected = normalize(content2)
  return { actual, expected, warnings, errors }
}
