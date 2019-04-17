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

test('i18n: translate modifier', async assert => {
  var { template } = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>{"submit" | translate}`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), 'Wyślij')
  assert.deepEqual(template({ language: 'en' }, escape), 'Send')
})

test('i18n: translate modifier for a string with dot', async assert => {
  var { template } = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div>{"button.submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: translate tag for a string with dot', async assert => {
  var { template } = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div><translate button.submit></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: translate modifier with a variable', async assert => {
  var { template } = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{foo | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl', foo: 'submit' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en', foo: 'submit' }, escape), '<div>Send</div>')
})

test('i18n: translate modifier with a variable with dot notation', async assert => {
  var { template } = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div>{foo | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl', foo: 'button.submit' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en', foo: 'button.submit' }, escape), '<div>Send</div>')
})

test('i18n: translations in json and a translate modifier', async assert => {
  var { template } = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div>{"submit" | translate}</div>`,
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

test('i18n: translations in yaml and a translate modifier', async assert => {
  var { template } = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script><div>{"submit" | translate}</div>`,
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

test('i18n: translations in yaml and a translate modifier with dot notation', async assert => {
  var { template } = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script><div>{"button.submit" | translate}</div>`,
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

test('i18n: loading translations from global yaml files', async assert => {
  var { template } = await compile(
    `<div><translate button.submit></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.yaml')] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>Send</div>')
})

test('i18n: loading translations from global json files', async assert => {
  var { template } = await compile(
    `<div><translate cancel></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.json')] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>anuluj</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>cancel</div>')
})

test('i18n: loading translations from global js files', async assert => {
  var { template } = await compile(
    `<div><translate cancel></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.js')] }
  )
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>anuluj</div>')
  assert.deepEqual(template({ language: 'en' }, escape), '<div>cancel</div>')
})

test('i18n: throws if the translate tag has no attribute', async assert => {
  await assert.throwsAsync(
    compile('<translate>'),
    /Translate tag must define a key/
  )
})

test('i18n: throws if there is a duplicate translation', async assert => {
  await assert.throwsAsync(
    compile('<div><translate cancel></div>', {
      languages: ['pl', 'en'],
      translationsPaths: [
        path.join(__dirname, '../../fixtures/translations/translations.json'),
        path.join(__dirname, '../../fixtures/translations/locales.json')
      ]
    }),
    /Translation already exists in .*/
  )
})

test('i18n: throws if the languages flag is not set', async assert => {
  await assert.throwsAsync(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`),
    /Compiler option is undefined: languages\./
  )

  await assert.throwsAsync(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit></div>`),
    /Compiler option is undefined: languages\./
  )
})

test('i18n: throws if a translation is missing', async assert => {
  await assert.throwsAsync(
    compile(`
      <script i18n yaml>
      submit:
      - Wyślij
      - Send
      </script>
      <div><translate copyright></div>
    `, { languages: ['pl', 'en'] }),
    /There is no translation for the copyright key/
  )

  await assert.throwsAsync(
    compile(`
      <script i18n yaml>
      copyright:
      - Wszystkie prawa zastrzeżone
      </script>
      <div><translate copyright></div>
    `, { languages: ['pl', 'en'] }),
    /There is no translation for the copyright key in en language/
  )

  await assert.throwsAsync(
    compile(`
      <script i18n yaml>
      copyright:
      - Wszystkie prawa zastrzeżone
      - All rights reserved
      </script>
      <div><translate contact></div>
    `, { languages: ['pl', 'en'] }),
    /There is no translation for the contact key/
  )
})

test('i18n: throws if the translation script is empty', async assert => {
  await assert.throwsAsync(
    compile(`
      <script i18n></script><div>{"foo" | translate}</div>
    `, { languages: ['pl', 'en'] }),
    /The translation script cannot be empty/
  )

  await assert.throwsAsync(
    compile(`
      <script i18n yaml></script><div>{"foo" | translate}</div>)
    `, { languages: ['pl', 'en'] }),
    /The translation script cannot be empty/
  )

  await assert.throwsAsync(
    compile(`
      <i18n></i18n><div><translate foo></div>
    `, { languages: ['pl', 'en'] }),
    /The translation script cannot be empty/
  )
})

test('i18n: throws if the yaml file is corrupt', async assert => {
  await assert.throwsAsync(
    compile(`
      <script i18n from="../../fixtures/translations/corrupt.yaml"></script>
      <div><translate button.submit></div>
    `,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }),
    /YAML translation is unparseable/
  )
})

test('i18n: throws if the json file is corrupt', async assert => {
  await assert.throwsAsync(
    compile(`
      <script i18n from="../../fixtures/translations/corrupt.json"></script>
      <div><translate button.submit></div>
    `,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }),
    /JSON translation is unparseable/
  )
})

test('i18n: throws if the js file is corrupt', async assert => {
  await assert.throwsAsync(
    compile(`
      <script i18n from="../../fixtures/translations/corrupt.js"></script>
      <div><translate button.submit></div>
    `,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }),
    /JS translation is unparseable/
  )
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
