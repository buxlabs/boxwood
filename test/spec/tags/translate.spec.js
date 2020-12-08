const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('translation: dynamic key', async assert => {
  const { template } = await compile(`
    <translate {foo}/>
    <data yaml>
    i18n:
      bar:
        pl: baz
    </data>
  `, {
    languages: ['pl']
  })
  assert.deepEqual(template({ language: 'pl', foo: 'bar' }, escape), 'baz')
})

test.skip('translation: dynamic key with a filter', async assert => {
  const { template } = await compile(`
    <translate {foo | underscore}/>
    <data yaml>
    i18n:
      bar_baz:
        pl: qux
    </data>
  `, {
    languages: ['pl']
  })
  assert.deepEqual(template({ language: 'pl', foo: 'bar-baz' }, escape), 'baz')
})
