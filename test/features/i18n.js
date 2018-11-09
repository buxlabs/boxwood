import test from 'ava'
import compile from '../helpers/compile'
import path from 'path'

test('i18n', async assert => {
  let template
  console.time('i18n')

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
    `<div><translate button.submit /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../fixtures/translations/translations.yaml')] }
  )
  assert.deepEqual(template({ language: 'pl' }, html => html), '<div>Wyślij</div>')

  template = await compile(
    `<script i18n json>{"submit": ["Wyślij Wiadomość", "Send the message"]}</script><div><translate submit /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../fixtures/translations/translations.json')] }
  )
  assert.deepEqual(template({ language: 'en' }, html => html), '<div>Send the message</div>')

  template = await compile(
    `<div><translate cancel /></div>`,
    { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../fixtures/translations/translations.json')] }
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

  // try {
  //   template = await compile('<div><translate cancel /></div>', {
  //     languages: ['pl', 'en'],
  //     translationsPaths: [
  //       path.join(__dirname, '../fixtures/translations/translations.json'),
  //       path.join(__dirname, '../fixtures/translations/locales.json'),
  //     ]
  //   })
  //   template({ language: 'pl' }, html => html)
  // }
  // catch (error) {
  //   console.log(error)
  //   assert.regex(error.message, /Translation already exists in .*/)
  // }

  // try {
  //   template = await compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div>{"submit" | translate}</div>`, {})
  // } catch (error) {
  //   assert.regex(error.message, /Compiler option is undefined: languages\./)
  // }

  // try {
  //   await compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`, {})
  // } catch (error) {
  //   assert.regex(error.message, /Compiler option is undefined: languages\./)
  // }

  // try {
  //   await compile(`<script i18n>export default { submit: ['Wyślij', 'Send'] }</script><div><translate submit /></div>`, {})
  // } catch (error) {
  //   assert.regex(error.message, /Compiler option is undefined: languages\./)
  // }

  // try {
  //   template = await compile(`
  //     <script i18n yaml>
  //     submit:
  //     - Wyślij
  //     - Send
  //     </script>
  //     <div><translate copyright /></div>`,
  //     { languages: ['pl', 'en'] }
  //   )
  //   template({ language: 'pl' }, html => html)
  // } catch (error) {
  //   assert.regex(error.message, /There is no translation for the copyright key/)
  // }

  // try {
  //   template = await compile(`
  //     <script i18n yaml>
  //     copyright:
  //     - Wszystkie prawa zastrzeżone
  //     </script>
  //     <div><translate copyright /></div>`,
  //     { languages: ['pl', 'en'] }
  //   )
  //   template({ language: 'en' }, html => html)
  // } catch (error) {
  //   assert.regex(error.message, /There is no translation for the copyright key in en language/)
  // }

  // try {
  //   template = await compile(`
  //     <script i18n yaml>
  //     copyright:
  //     - Wszystkie prawa zastrzeżone
  //     - All rights reserved
  //     </script>
  //     <div><translate contact /></div>`,
  //     { languages: ['pl', 'en'] }
  //   )
  //   template({ language: 'en' }, html => html)
  // } catch (error) {
  //   assert.regex(error.message, /There is no translation for the contact key/)
  // }

  // try {
  //   template = await compile(`<script i18n></script><div>{"foo" | translate}</div>`,
  //     { languages: ['pl', 'en'] }
  //   )
  //   template({ language: 'en' }, html => html)
  // } catch (error) {
  //   assert.regex(error.message, /The translation script cannot be empty/)
  // }

  // try {
  //   template = await compile(`<script i18n yaml></script><div>{"foo" | translate}</div>)`,
  //     { languages: ['pl', 'en'] }
  //   )
  //   template({ language: 'en' }, html => html)
  // } catch (error) {
  //   assert.regex(error.message, /The translation script cannot be empty/)
  // }

  console.timeEnd('i18n')
})
