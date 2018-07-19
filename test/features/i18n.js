const { equal, throws } = require('assert')
const { compile } = require('../..')

console.time('i18n')

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

equal(compile(`
<script i18n>export default { 'submit': ['Wyślij', 'Send'] }</script>
<div>{"submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'pl' }, html => html), `<div>Wyślij</div>`)

equal(compile(`
<script i18n>export default { 'button.submit': ['Wyślij', 'Send'] }</script>
<div>{"button.submit" | translate}</div>
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
<div>{"submit" | translate}</div>
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
<div>{"submit" | translate}</div>
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
<div>{"button.submit" | translate}</div>
`, { languages: ['pl', 'en'] })({ language: 'en' }, html => html), `<div>Send</div>`)

throws(function () {
  compile(`
  <script i18n>export default { submit: ['Wyślij', 'Send'] }</script>
  <div>{"submit" | translate}</div>
  `, {})
}, /Compiler option is undefined: languages\./)

console.timeEnd('i18n')
