const { equal, throws } = require('assert')
const compile = require('../helpers/compile')
const path = require('path')

console.time('i18n')

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n>export default { 'submit': ['Wyślij', 'Send'] }</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { 'submit': ['Wyślij', 'Send'] }</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script>
<div>{"button.submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script>
<div><translate button.submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div>{foo | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl', foo: 'submit' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script>
<div>{foo | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl', foo: 'button.submit' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n json>
{
  "submit": ["Wyślij", "Send"]
}
</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n json>
{
  "submit": ["Wyślij", "Send"]
}
</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n json>
{
  "submit": ["Wyślij", "Send"]
}
</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n json>
{
  "submit": ["Wyślij", "Send"]
}
</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n yaml>
submit:
- Wyślij
- Send
</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n yaml>
submit:
- Wyślij
- Send
</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n yaml>
submit:
- Wyślij
- Send
</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n yaml>
submit:
- Wyślij
- Send
</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n yaml>
button.submit:
- Wyślij
- Send
</script>
<div>{"button.submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n yaml>
button.submit:
- Wyślij
- Send
</script>
<div><translate button.submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n yaml>
button.submit:
- Wyślij
- Send
</script>
<div>{"button.submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n yaml>
button.submit:
- Wyślij
- Send
</script>
<div><translate button.submit /></div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n json>
{
  "submit": ["Wyślij Wiadomość", "Send the message"]
}
</script>
<div><translate submit /></div>
`, { languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../fixtures/translations/translations.json')] })
({ language: 'en' }, html => html), `<div>Send the message</div>`)

equal(compile(`<div><translate cancel /></div>`, {
  languages: ['pl', 'en'], translationsPaths: [path.join(__dirname, '../fixtures/translations/translations.json')]
})({ language: 'pl' }, html => html), `<div>anuluj</div>`)

throws(function () {
  compile(`<div><translate cancel /></div>`, {
    languages: ['pl', 'en'],
    translationsPaths: [
      path.join(__dirname, '../fixtures/translations/translations.json'),
      path.join(__dirname, '../fixtures/translations/locales.json'),
    ]
  })({ language: 'pl' }, html => html)
}, /Translation already exists in .*/)

throws(function () {
  compile(`
  <script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
  <div>{"submit" | translate}</div>
  `, {})
}, /Compiler option is undefined: languages\./)

throws(function () {
  compile(`
  <script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
  <div><translate submit /></div>
  `, {})
}, /Compiler option is undefined: languages\./)

throws(function () {
  compile(`
  <script i18n yaml>
  submit:
  - Wyślij
  - Send
  </script>
  <div><translate copyright /></div>
  `, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html)
}, /There is no translation for the copyright key/)

throws(function () {
  compile(`
  <script i18n yaml>
  copyright:
  - Wszystkie prawa zastrzeżone
  </script>
  <div><translate copyright /></div>
  `, { languages: ['pl', 'en'] })({ language: 'en' }, html => html)
}, /There is no translation for the copyright key in en language/)

throws(function () {
  compile(`
  <script i18n yaml>
  copyright:
  - Wszystkie prawa zastrzeżone
  - All rights reserved
  </script>
  <div><translate contact /></div>
  `, { languages: ['pl', 'en'] })({ language: 'en' }, html => html)
}, /There is no translation for the contact key/)

throws(function () {
  compile(`<script i18n></script><div>{"foo" | translate}</div>)`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html)
}, /The translation script cannot be empty/)

throws(function () {
  compile(`<script i18n yaml></script><div>{"foo" | translate}</div>)`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html)
}, /The translation script cannot be empty/)

console.timeEnd('i18n')
