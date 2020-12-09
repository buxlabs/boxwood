const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('translate: dynamic key', async assert => {
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

test('translate: dynamic key with a filter', async assert => {
  const { template, warnings, errors } = await compile(`
    <translate {foo|underscore}/>
    <data yaml>
    i18n:
      bar_baz:
        pl: qux
    </data>
  `, {
    languages: ['pl']
  })
  assert.deepEqual(template({ language: 'pl', foo: 'bar-baz' }, escape), 'qux')
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(errors.length, 0)
})

test('translate: filters', async assert => {
  var { template } = await compile(`
    <script i18n yaml>
      foo:
      - 'foo'
      - 'foo'
    </script>
    <translate foo|uppercase/>
  `, { languages: ['pl', 'en'] })
  assert.deepEqual(template({ language: 'pl' }, escape), 'FOO')

  var { template } = await compile(`
    <script i18n yaml>
      foo:
      - 'foo'
      - 'foo'
    </script>
    <translate foo|uppercase|lowerfirst|reverse/>
  `, { languages: ['pl', 'en'] })
  assert.deepEqual(template({ language: 'pl' }, escape), 'OOf')

  var { template } = await compile(`
    <script i18n yaml>
      foo:
      - 'foo {bar}'
      - 'foo {bar}'
    </script>
    <translate foo|uppercase|lowerfirst|reverse bar="{bar}" />
  `, { languages: ['pl', 'en'] })
  assert.deepEqual(template({ language: 'pl', bar: 'bar' }, escape), 'RAB OOf')
})
