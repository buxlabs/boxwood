const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { escape } = require('../../..')

test('data: duplicate translation', async assert => {
  const { errors } = await compile(`
    <data yaml>
    i18n:
      buy_now:
        pl: Kup teraz
        en: Buy now
      foo:
        pl: foo
        en: bar
      buy_now:
        pl: Kup teraz
        en: Buy now
    </data>
  `)
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].type, 'YAMLTranslationError')
  assert.truthy(errors[0].message.includes('Map keys must be unique at line 9, column 7:'))
})

test('data: missing format attribute', async assert => {
  const { errors } = await compile(`
    <data>
    i18n:
      read_more:
        pl: Czytaj więcej
        en: Read more
    </data>
  `)
  assert.deepEqual(errors.length, 1)
  assert.deepEqual(errors[0].type, 'TranslationError')
  assert.deepEqual(errors[0].message, 'Data tag must specify a format (js, json or yaml).')
})
