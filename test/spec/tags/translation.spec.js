const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')
const { join } = require('path')

test('translation: handles text nodes', async assert => {
  const { template } = await compile(`
    <translation pl>foo</translation>
    <translation en>bar</translation>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), 'foo')
  assert.deepEqual(template({ language: 'en' }, escape), 'bar')
})

test('translation: handles nested nodes', async assert => {
  const { template } = await compile(`
    <translation pl><p>foo</p></translation>
    <translation en><p>bar</p></translation>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<p>foo</p>')
  assert.deepEqual(template({ language: 'en' }, escape), '<p>bar</p>')
})

test('translation: handles variables', async assert => {
  const { template } = await compile(`
    <translation pl><p>{foo}</p></translation>
    <translation en><p>{bar}</p></translation>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl', foo: 'baz' }, escape), '<p>baz</p>')
  assert.deepEqual(template({ language: 'en', bar: 'qux' }, escape), '<p>qux</p>')
})

test('translations: throws if translation tag is empty', async assert => {
  const { errors } = await compile(`
    <translation pl></translation>
    <translation en></translation>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(errors.length, 2)
  assert.deepEqual(errors[0].type, 'TranslationError')
  assert.deepEqual(errors[0].message, 'Translation tag cannot be empty')
  assert.deepEqual(errors[1].type, 'TranslationError')
  assert.deepEqual(errors[1].message, 'Translation tag cannot be empty')
})

test('translations: throws if the language attribute is missing', async assert => {
  const { errors } = await compile(`
    <translation>foo</translation>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].type, 'TranslationError')
  assert.deepEqual(errors[0].message, 'Translation tag needs to have a language attribute')
})

test('translations: throws if the language attribute is not specified in compiler options', async assert => {
  const { errors } = await compile(`
    <translation pl>foo</translation>
  `, {
    languages: ['en']
  })
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].type, 'TranslationError')
  assert.deepEqual(errors[0].message, 'Translation tag uses a language that is not specified in compiler options: pl')
})

