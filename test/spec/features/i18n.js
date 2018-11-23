import test from '../../helpers/test'
import compile from '../../helpers/compile'
import path from 'path'

test('i18n', async assert => {
  let template

  template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n>export default { 'submit': ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { 'submit': ['Wyślij', 'Send'] }</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div>{"button.submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div><translate button.submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{foo | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl', foo: 'submit' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script><div>{foo | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl', foo: 'button.submit' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div>{"submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n json>{"submit": ["Wyślij", "Send"]}</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script>
    <div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script>
    <div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n yaml>
     submit:
     - Wyślij
     - Send
    </script>
    <div><translate submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script>
    <div>{"button.submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script>
    <div><translate button.submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script>
    <div>{"button.submit" | translate}</div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n yaml>
     button.submit:
     - Wyślij
     - Send
    </script>
    <div><translate button.submit /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send</div>')

  template = await compile(
    `<script i18n from="../../fixtures/translations/buttons.yaml"></script>
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n from="../../fixtures/translations/buttons.json"></script>
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<i18n from="../../fixtures/translations/buttons.yaml" />
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<i18n from="../../fixtures/translations/buttons.js" />
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<i18n from="../../fixtures/translations/buttons.json" />
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<i18n from="../../fixtures/translations/buttons.js" />
    <div><translate button.submit /></div>`,
    {
      paths: [__dirname],
      languages: ['pl', 'en']
    }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<div><translate button.submit /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.yaml')] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n json>{"submit": ["Wyślij Wiadomość", "Send the message"]}</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.json')] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send the message</div>')

  template = await compile(
    `<div><translate cancel /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../../fixtures/translations/translations.json')] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>anuluj</div>')

  template = await compile(
    `<i18n yaml>
     hello:
     - 'Cześć'
     - 'Hello'
     </i18n>
    <div><translate hello /></div>`,
    { languages: ['pl', 'en'] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Cześć</div>')

await   assert.throws(
    compile('<div><translate cancel /></div>', {
      languages: ['pl', 'en'],
      translationsPaths: [
        path.join(__dirname, '../../fixtures/translations/translations.json'),
        path.join(__dirname, '../../fixtures/translations/locales.json')
      ]
    }),
    /Translation already exists in .*/
  )

  await assert.throws(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`),
    /Compiler option is undefined: languages\./
  )

  await assert.throws(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`),
    /Compiler option is undefined: languages\./
  )

  await assert.throws(
    compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`),
    /Compiler option is undefined: languages\./
  )

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
})
