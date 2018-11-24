import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'

test('i18n: translate modifier', async assert => {
  const template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translate tag', async assert => {
  const template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translate modifier for a string with dot', async assert => {
  const template = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div>{"button.submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translate tag for a string with dot', async assert => {
  const template = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div><translate button.submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translate modifier with a variable', async assert => {
  const template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{foo | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl', foo: 'submit' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en', foo: 'submit' }, html => html), '<div>Send</div>')
})

test('i18n: translate modifier with a variable', async assert => {
  const template = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div>{foo | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl', foo: 'button.submit' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en', foo: 'button.submit' }, html => html), '<div>Send</div>')
})

test('i18n: translations in json and a translate modifier', async assert => {
  const template = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translations in json and a translate tag', async assert => {
  const template = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translations in yaml and a translate modifier', async assert => {
  const template = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translations in yaml and a translate tag', async assert => {
  const template = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translations in yaml and a translate modifier with dot notation', async assert => {
  const template = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script><div>{"button.submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: translations in yaml and a translate tag with dot notation', async assert => {
  const template = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script><div><translate button.submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: loading translations from yaml', async assert => {
  const template = await compile(
    `<script i18n from="../../fixtures/translations/buttons.yaml"></script>
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: loading translations from json', async assert => {
  const template = await compile(
    `<script i18n from="../../fixtures/translations/buttons.json"></script>
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: loading translations from js', async assert => {
  const template = await compile(
    `<script i18n from="../../fixtures/translations/buttons.json"></script>
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: loading translations from global yaml files', async assert => {
  const template = await compile(
    `<div><translate button.submit /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.yaml')] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')
})

test('i18n: loading translations from global json files', async assert => {
  const template = await compile(
    `<div><translate cancel /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.json')] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>anuluj</div>')
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>cancel</div>')
})

test('i18n: throws if there is a duplicate translation', async assert => {
  await assert.throws(
    compile('<div><translate cancel /></div>', {
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
  await assert.throws(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`),
    /Compiler option is undefined: languages\./
  )

  await assert.throws(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`),
    /Compiler option is undefined: languages\./
  )
})

test('i18n: throws if a translation is missing', async assert => {
  await assert.throws(
    compile(`
      <script i18n yaml>
      submit:
      - Wyślij
      - Send
      </script>
      <div><translate copyright /></div>
    `, { languages: ['pl', 'en'] }),
    /There is no translation for the copyright key/
  )

  await assert.throws(
    compile(`
      <script i18n yaml>
      copyright:
      - Wszystkie prawa zastrzeżone
      </script>
      <div><translate copyright /></div>
    `, { languages: ['pl', 'en'] }),
    /There is no translation for the copyright key in en language/
  )

  await assert.throws(
    compile(`
      <script i18n yaml>
      copyright:
      - Wszystkie prawa zastrzeżone
      - All rights reserved
      </script>
      <div><translate contact /></div>
    `, { languages: ['pl', 'en'] }),
    /There is no translation for the contact key/
  )
})

test('i18n: throws if the translation script is empty', async assert => {
  await assert.throws(
    compile(`
      <script i18n></script><div>{"foo" | translate}</div>
    `, { languages: ['pl', 'en'] }),
    /The translation script cannot be empty/
  )

  await assert.throws(
    compile(`
      <script i18n yaml></script><div>{"foo" | translate}</div>)
    `, { languages: ['pl', 'en'] }),
    /The translation script cannot be empty/
  )

  await assert.throws(
    compile(`
      <i18n></i18n><div><translate foo /></div>
    `, { languages: ['pl', 'en'] }),
    /The translation script cannot be empty/
  )
})
