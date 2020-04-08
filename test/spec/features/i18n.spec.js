const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const { escape } = require('../../..')

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

test('i18n: dynamic tags', async assert => {
  var { template } = await compile(`
    <i18n>export default { month_0: ["Styczeń", "January"] }</i18n>
    <translate month_{index}>`, { languages: ['pl', 'en'] })
  assert.deepEqual(template({ language: 'pl', index: '0' }, escape), 'Styczeń')
  assert.deepEqual(template({ language: 'en', index: '0' }, escape), 'January')
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

test('i18n: translations in yaml - format validation', async assert => {
  var { template, errors } = await compile(`
    <script i18n yaml>
    foo:
    -'bar'
    -'bar'
    </script>
    <div><translate foo/></div>
  `, { languages: ['pl', 'en'] })
  
  assert.truthy(errors.length)
  var [error1, error2] = errors
  assert.deepEqual(error1.type, 'TranslationError')
  assert.deepEqual(error1.message, 'YAML translation is unparseable')
  assert.deepEqual(error2.type, 'TranslationError')
  assert.deepEqual(error2.message, 'There is no translation for the foo___scope_746128617 key')
  assert.deepEqual(template({ language: 'pl' }, escape), '<div></div>')

  var { template, errors } = await compile(`
    <template foo>
      <script i18n yaml>
      foo:
      -'bar'
      -'bar'
      </script>
      <div><translate foo/></div>
    </template>
    <foo/>
  `, { languages: ['pl', 'en'] })
  
  assert.truthy(errors.length)
  var [error1, error2] = errors
  assert.deepEqual(error1.type, 'TranslationError')
  assert.deepEqual(error1.message, 'YAML translation is unparseable')
  assert.deepEqual(error2.type, 'TranslationError')
  assert.deepEqual(error2.message, 'There is no translation for the foo___scope_196157161 key')
  assert.deepEqual(template({ language: 'pl' }, escape), '<div></div>')

  var { template, errors } = await compile(`
    <template foo>
      <script i18n yaml>
      foo_bar:
      -'foo_bar'
      -'foo_bar'
      </script>
      <div><translate foo_{bar}/></div>
    </template>
    <foo/>
  `, { languages: ['pl', 'en'] })
  
  assert.truthy(errors.length)
  var [error1] = errors
  assert.deepEqual(error1.type, 'TranslationError')
  assert.deepEqual(error1.message, 'YAML translation is unparseable')
  assert.deepEqual(template({ language: 'pl', bar: 'bar' }, escape), '<div></div>')  
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

test('i18n: multiple translations', async assert => {
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
      <h1><translate title/></h1>
      <p><translate submit/></p>
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

test('i18n: scoped translations works with partial tag', async assert => {
  var { template } = await compile(`<import index from="./scoped/partials/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foofoobarbar</div>')
})

test('i18n: scoped translations works with include tag', async assert => {
  var { template } = await compile(`<import index from="./scoped/includes/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foofoobarbar</div>')
})

test('i18n: scoped translations works with render tag', async assert => {
  var { template } = await compile(`<import index from="./scoped/renders/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foofoobarbar</div>')
})

test('i18n: scoped translations works with partial attribute', async assert => {
  var { template } = await compile(`<import index from="./scoped/attributes/index.html"><index/>`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div>foo<div>foo</div>bar<div>bar</div></div>')
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

test('i18n: passing language attribute to the partial', async assert => {
  var { template } = await compile(`
    <import qux from="./attributes/qux.html"><qux language="{language}"/>
  `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<!doctype html><html lang="pl"><body>foo</body></html>')
})

test('i18n: dynamic scoped translations in conditions', async assert => {
  var { template } = await compile(`
    <i18n yaml>
    foo:
    - 'foo'
    - 'foo'
    bar:
    - 'bar'
    - 'bar'
    </i18n>
    <import ban from="./attributes/ban.html">
    <ban 
      foo|translate="foo" 
      bar|translate="bar" 
    />`, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div><h1>foo</h1><h2>bar</h2></div>')
})

test('i18n: dynamic scoped translations in conditions with translations at the bottom', async assert => {
  var { template } = await compile(`
    <import ban from="./attributes/ban.html">
    <ban
      foo|translate="baz"
      bar|translate="qux"
    />
    <i18n yaml>
    baz:
    - 'baz'
    - 'baz'
    qux:
    - 'qux'
    - 'qux'
    </i18n>
  `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), '<div><h1>baz</h1><h2>qux</h2></div>')
})

test('i18n: dynamic translations', async assert => {
  var { template } = await compile(`
    <i18n yaml>
    read_more:
    - 'Czytaj więcej {foo}'
    - 'Read more {foo}'
    </i18n>
    <div><translate read_more foo="foo"/></div>
    `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl', foo: 'foo' }, escape), '<div>Czytaj więcej foo</div>')  
  
  var { template } = await compile(`
    <i18n yaml>
    read_more:
    - 'Czytaj więcej {foo}'
    - 'Read more {foo}'
    </i18n>
    <div><translate read_more foo="{foo}"/></div>
    `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl', foo: 'foo' }, escape), '<div>Czytaj więcej foo</div>')

  var { template } = await compile(`
    <i18n yaml>
    budget:
    - 'Planowany budżet mojego projektu {price}{currency}'
    - 'Estimated budget of my project {price}{currency}'
    </i18n>
    <div><translate budget foo="{foo}"/></div>
    `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'en', price: '10000', currency: '$' }, escape), '<div>Estimated budget of my project 10000$</div>')
  
  var { template } = await compile(`
    <i18n yaml>
    total_price:
    - 'Cena po uwzględnieniu podatku: {price * tax}'
    - 'Price after tax: {price * tax}'
    </i18n>
    <div><translate total_price price="{price}" tax="{tax"}/></div>
    `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl', price: '10000', tax: 1.23 }, escape), '<div>Cena po uwzględnieniu podatku: 12300</div>')

  var { template } = await compile(`
    <template footer>
      <script i18n yaml>
        contact:
        - 'Skontaktuj się z nami. BUXLABS. Na rynku od {year}. Wszelkie prawa zastrzeżone.'
        - 'Contact us. BUXLABS. Since {year}. All rights reserved.'     
      </script>
      <footer>
        <translate contact year="{year}"/>
      </footer>
    </template>
    <script i18n yaml>
      hello:
      - 'Witaj {name}!'
      - 'Hello {name}!'
    </script>
    <main>
      <p><translate hello name="{name}"/></p>
      <footer year="{year}"/>
    </main>
    `, { 
      paths: [path.join(__dirname, '../../fixtures/translations')], 
      languages: ['pl', 'en']
    })
  assert.deepEqual(template({ language: 'en', year: 2019, name: 'World' }, escape), '<main><p>Hello World!</p><footer>Contact us. BUXLABS. Since 2019. All rights reserved.</footer></main>')   
})

test('i18n: loading translations from files', async assert => {
  const { template, warnings, errors } = await compile(`
    <translate foo>
    <i18n from="./bar.json">
  `, {
    paths: [path.join(__dirname, '../../fixtures/translations')],
    languages: ['pl', 'en']
  })
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(errors.length, 0)
  assert.deepEqual(template({ language: 'pl' }, escape), 'foo1')
  assert.deepEqual(template({ language: 'en' }, escape), 'foo2')
})

test('i18n: translations with slots', async assert => {
  const { template } = await compile(`
    <translate foo><a href="/bar">baz</a></translate>
    <i18n yaml>
      foo:
      - 'qux {slot}'
      - '{ slot } qux'
    </i18n>
  `, {
    languages: ['pl', 'en']
  })
  assert.deepEqual(template({ language: 'pl' }, escape), 'qux <a href=\'/bar\'>baz</a>')
  assert.deepEqual(template({ language: 'en' }, escape), '<a href=\'/bar\'>baz</a> qux')
})

test('i18n: translations with named languages', async assert => {
  const { template } = await compile(`
    <translate foo>
    <i18n yaml>
      foo:
        en: Hello
        pl: Siema
    </i18n>
  `, {
    languages: ['en', 'pl']
  })
  assert.deepEqual(template({ language: 'en' }, escape), 'Hello')
  assert.deepEqual(template({ language: 'pl' }, escape), 'Siema')
})
