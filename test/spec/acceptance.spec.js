const test = require('ava')
const deprecatedCompile = require('../helpers/deprecated-compile')
const compile = require('../helpers/compile')
const { normalize } = require('../helpers/string')
const { join } = require('path')
const { escape } = require('../..')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

test('acceptance: aliased-attributes (deprecated)', async assert => {
  const { actual, expected } = await suite('deprecated/aliased-attributes')
  assert.deepEqual(actual, expected)
})

test('acceptance: aliased-attributes (html)', async assert => {
  const { actual, expected } = await suite('html/aliased-attributes', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: booleans (deprecated)', async assert => {
  const { actual, expected, warnings, errors } = await suite('deprecated/booleans')
  assert.deepEqual(actual, expected)
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(errors.length, 0)
})

test('acceptance: booleans (html)', async assert => {
  const { actual, expected } = await suite('html/booleans', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: components-in-a-loop (deprecated)', async assert => {
  const { actual, expected } = await suite('deprecated/components-in-a-loop')
  assert.deepEqual(actual, expected)
})

test('acceptance: components-in-a-loop (html)', async assert => {
  const { actual, expected } = await suite('html/components-in-a-loop', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: same-attributes (deprecated)', async assert => {
  const { actual, expected } = await suite('deprecated/same-attributes')
  assert.deepEqual(actual, expected)
})

test('acceptance: same-attributes (html)', async assert => {
  const { actual, expected } = await suite('html/same-attributes', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: objects-as-parameters (deprecated)', async assert => {
  const { actual, expected } = await suite('deprecated/objects-as-parameters')
  assert.deepEqual(actual, expected)
})

test('acceptance: objects-as-parameters (html)', async assert => {
  const { actual, expected } = await suite('html/objects-as-parameters', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: components-with-box-model-attributes (deprecated)', async assert => {
  const { actual, expected } = await suite('deprecated/components-with-box-model-attributes')
  assert.deepEqual(actual, expected)
})

test('acceptance: components-with-box-model-attributes (html)', async assert => {
  const { actual, expected } = await suite('html/components-with-box-model-attributes', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: import-multiple-components (deprecated)', async assert => {
  const { actual, expected } = await suite('deprecated/import-multiple-components')
  assert.deepEqual(actual, expected)
})

test('acceptance: import-multiple-components (html)', async assert => {
  const { actual, expected } = await suite('html/import-multiple-components', { compiler: 'new', extension: 'html' })
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

test('acceptance: email', async assert => {
  const { actual, expected, warnings, errors } = await suite('email')
  assert.deepEqual(actual, expected)
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(errors.length, 0)
})

test('acceptance: scoped-styles-head', async assert => {
  const { actual, expected } = await suite('scoped-styles-head')
  assert.deepEqual(actual, expected)
})

test('acceptance: scoped-styles-divs', async assert => {
  const { actual, expected } = await suite('scoped-styles-divs')
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

test('acceptance: scoped-styles-import', async assert => {
  const { actual, expected } = await suite('scoped-styles-import', { compiler: 'new', extension: 'js' })
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

test('acceptance: shorthand-attribute-syntax', async assert => {
  const { actual, expected, errors } = await suite('shorthand-attribute-syntax')
  assert.deepEqual(errors.length, 0)
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

test('acceptance: name-collision', async assert => {
  const { actual, expected } = await suite('name-collision')
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
  const { actual, expected } = await suite('invoice', { compilerOptions: { compact: false } })
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

test('acceptance: translate-modifier', async assert => {
  const { actual, expected } = await suite('translate-modifier')
  assert.deepEqual(actual, expected)
})

test.skip('acceptance: accordion (html)', async assert => {
  const { actual, expected } = await suite('html/accordion', { compiler: 'new', extension: 'html' })
  assert.deepEqual(actual, expected)
})

test('acceptance: accordion (js)', async assert => {
  const { actual, expected } = await suite('accordion', { compiler: 'new', extension: 'js' })
  assert.deepEqual(actual, expected)
})

test('acceptance: translation-missing', async assert => {
  const { actual, expected, errors } = await suite('translation-missing')
  assert.deepEqual(actual, expected)
  const { type, message, stack } = errors[0]
  assert.deepEqual(type, 'TranslationError')
  assert.deepEqual(message, "There is no translation for the foo___scope_1935881905 key in de language.")
  assert.truthy(stack.includes('components/foo.html'))
})

test('acceptance: class-square-tag', async assert => {
  const { actual, expected, errors } = await suite('class-square-tag')
  assert.deepEqual(actual, expected)
  assert.deepEqual(errors.length, 0)
})

test('acceptance: menu', async assert => {
  const { actual, expected } = await suite('menu')
  assert.deepEqual(actual, expected)
})

test('acceptance: translation-tag', async assert => {
  const { actual, expected } = await suite('translation-tag')
  assert.deepEqual(actual, expected)
})

test.skip('acceptance: price-calculator', async assert => {
  const { actual, expected } = await suite('price-calculator')
  assert.deepEqual(actual, expected)
})

test('acceptance: same-classes-scoped', async assert => {
  const { actual, expected } = await suite('same-classes-scoped')
  assert.deepEqual(actual, expected)
})

test('acceptance: landing-page', async assert => {
  const { actual, expected } = await suite('landing-page', { extension: 'js' })
  assert.deepEqual(actual, expected)
})

test('acceptance: states', async assert => {
  const { actual, expected } = await suite('states')
  assert.deepEqual(actual, expected)
})

test.skip('acceptance: counter', async assert => {
  const { actual, expected } = await suite('counter', { extension: 'js' })
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

test('acceptance: i18n', async assert => {
  const { actual, expected } = await suite('i18n', { compiler: 'new', extension: 'js' })
  assert.deepEqual(actual, expected)
})

test('acceptance: yaml', async assert => {
  const { actual, expected } = await suite('yaml', { compiler: 'new', extension: 'js' })
  assert.deepEqual(actual, expected)
})

test('acceptance: inline-stylesheets', async assert => {
  const { actual, expected } = await suite('inline-stylesheets', { compiler: 'new', extension: 'js' })
  assert.deepEqual(actual, expected)
})

test('acceptance: inline-images', async assert => {
  const { actual, expected } = await suite('inline-images', { compiler: 'new', extension: 'js' })
  assert.deepEqual(actual, expected)
})

async function suite (name, { compilerOptions = {} , extension = 'html', compiler = 'deprecated' } = {}) {
  const dir = join(__dirname, '../fixtures/acceptance', extension === 'js' ? `js/${name}` : name)
  const path1 = join(dir, `actual.${extension}`)
  const path2 = join(dir, 'expected.html')
  const path3 = join(dir, 'data.json')
  const content1 = await readFile(path1, 'utf8')
  const content2 = await readFile(path2, 'utf8')
  const content3 = await readFile(path3, 'utf8')
  const compilers = {
    deprecated: deprecatedCompile,
    new: compile
  }
  const { template, warnings, errors } = await compilers[compiler](content1, {
    path: path1,
    paths: [
      dir
    ],
    languages: ['pl', 'en', 'de'],
    script: {
      paths: [
        join(__dirname, '../../node_modules')
      ]
    },
    format: extension,
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
