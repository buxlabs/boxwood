const test = require('ava')
const compile = require('../../helpers/compile')
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
  assert.deepEqual(errors[0].message, 'Map keys must be unique; "buy_now" is repeated')
})
