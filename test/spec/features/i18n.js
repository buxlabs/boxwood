import test from 'ava'
import compile from '../../helpers/compile'
import path from 'path'
import escape from 'escape-html'

test('i18n: translate tag', async assert => {
  var { template } = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><translate submit>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), 'Wyślij')
  assert.deepEqual(template({ language: 'en' }, escape), 'Send')
})

test('i18n: translate tag with translations defined at the end of the file', async assert => {
  var { template } = await compile(
    `<translate submit><script i18n>export default { submit: ['Wyślij', 'Send'] }</script>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), 'Wyślij')
  assert.deepEqual(template({ language: 'en' }, escape), 'Send')
})

test('i18n: translate tag for a string with dot', async assert => {
  var { template } = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div><translate button.submit></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: translations in json and a translate tag', async assert => {
  var { template } = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div><translate submit></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: translations in yaml and a translate tag', async assert => {
  var { template } = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script><div><translate submit></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: translations in yaml and a translate tag with dot notation', async assert => {
  var { template } = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script><div><translate button.submit></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: loading translations from yaml', async assert => {
  var { template } = await compile(
    `<script i18n from="../../fixtures/translations/buttons.yaml"></script>
    <div><translate button.submit></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: loading translations from json', async assert => {
  var { template } = await compile(
    `<script i18n from="../../fixtures/translations/buttons.json"></script>
    <div><translate button.submit></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: loading translations from js', async assert => {
  var { template } = await compile(
    `<script i18n from="../../fixtures/translations/buttons.js"></script>
    <div><translate button.submit></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: throws if a translation is missing', async assert => {
  var { errors } = await compile(`
      <script i18n yaml>
      submit:
      - Wyślij
      - Send
      </script>
      <div><translate copyright></div>
    `, { languages: ['pl', 'en'] })
  assert.regex(errors[0].message, /no translation for the copyright/)

  var { errors } = await compile(`
      <script i18n yaml>
      copyright:
      - Wszystkie prawa zastrzeżone
      </script>
      <div><translate copyright></div>
    `, { languages: ['pl', 'en'] })
  assert.regex(errors[0].message, /no translation for the copyright/)

  var { errors } = await compile(`
      <script i18n yaml>
      copyright:
      - Wszystkie prawa zastrzeżone
      - All rights reserved
      </script>
      <div><translate contact></div>
    `, { languages: ['pl', 'en'] })
  assert.regex(errors[0].message, /no translation for the contact/)
})

test('i18n: throws if the translation script is empty', async assert => {
  var { errors } = await compile(`<script i18n></script><div>{"foo" | translate}</div>`, { languages: ['pl', 'en'] })
  assert.regex(errors[0].message, /The translation script cannot be empty/)
  var { errors } = await compile(`<script i18n yaml></script><div>{"foo" | translate}</div>)`, { languages: ['pl', 'en'] })
  assert.regex(errors[0].message, /The translation script cannot be empty/)
  var { errors } = await compile(`<script i18n yaml></script><div><translate foo></div>`, { languages: ['pl', 'en'] })
  assert.regex(errors[0].message, /The translation script cannot be empty/)
})

test('i18n: throws if the yaml file is corrupt', async assert => {
  var { errors } = await compile(`
    <script i18n from="../../fixtures/translations/corrupt.yaml"></script>
    <div><translate button.submit></div>
  `,
  {
    paths: [__dirname],
    languages: ['pl', 'en']
  })
  assert.regex(errors[0].message, /YAML translation is unparseable/)
})

test('i18n: throws if the json file is corrupt', async assert => {
  var { errors } = await compile(`
      <script i18n from="../../fixtures/translations/corrupt.json"></script>
      <div><translate button.submit></div>
    `,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    })
  assert.deepEqual(errors[0].message, 'JSON translation is unparseable')
})

test('i18n: throws if the js file is corrupt', async assert => {
  var { errors } = await compile(`
      <script i18n from="../../fixtures/translations/corrupt.js"></script>
      <div><translate button.submit></div>
    `,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    })
  assert.deepEqual(errors[0].message, 'JS translation is unparseable')
})

test('i18n: self-closing syntax', async assert => {
  var { template } = await compile(
    `<script i18n yaml>
     title:
     - Tytuł
     - Title
     submit:
     - Wyślij
     - Send
    </script>
    <div>
      <h1><translate title></h1>
      <p><translate submit></p>
    </div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div><h1>Tytuł</h1><p>Wyślij</p></div>')
})

test('i18n: translations are scoped per file', async assert => {
  var { template } = await compile(`<import index from="./scoped/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), 'foobar')
})

test('i18n: scoped translations works with nested components', async assert => {
  var { template } = await compile(`<import index from="./scoped/nested/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>indexfoobarbazban</div>')
})

test.skip('i18n: scoped translations works with partial tag', async assert => {
  var { template } = await compile(`<import index from="./scoped/partials/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foofoobarbar</div>')
})

test.skip('i18n: scoped translations works with include tag', async assert => {
  var { template } = await compile(`<import index from="./scoped/partials/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foofoobarbar</div>')
})

test.skip('i18n: scoped translations works with render tag', async assert => {
  var { template } = await compile(`<import index from="./scoped/partials/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foofoobarbar</div>')
})

test('i18n: passing scoped translations as a parameter', async assert => {
  var { template } = await compile(`
    <import foo from="./attributes/foo.html">
    <foo foo|translate="bar"/>
    <i18n yaml>
    bar:
    - 'baz'
    - 'baz'
    </i18n>
  `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>baz</div>')
})

test('i18n: passing scoped translations as a parameter through one layer', async assert => {
  var { template } = await compile(`
    <import bar from="./attributes/bar.html">
    <bar foo|translate="bar"/>
    <i18n yaml>
    bar:
    - 'baz'
    - 'baz'
    </i18n>
  `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>baz</div>')
})

test('i18n: passing scoped translations as a parameter one layer down', async assert => {
  var { template } = await compile(`
    <import baz from="./attributes/baz.html"><baz/>
  `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>bar</div>')
})
