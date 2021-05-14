const test = require('ava')
const compile = require('../../helpers/deprecated-compile')
const { join } = require('path')
const { escape } = require('../../..')

test('style[colors]: custom colors', async assert => {
  var { template } = await compile(`<style>.button { color: red; }</style>`, { styles: { colors: { red: '#FF6347' } } })
  assert.deepEqual(template({}, escape), '<style>.button { color: #FF6347; }</style>')
})

test('style[colors]: mixed colors', async assert => {
  var { template } = await compile(`<style>.button { color: red; } .blue.button { color: myBeautifulBlue; } .yellow.button { color: yellow }</style>`, {
    styles: {
      colors: {
        red: '#FF6347',
        myBeautifulBlue: '#6495ED'
      }
    }
  })
  assert.deepEqual(template({}, escape), `<style>.button { color: #FF6347; } .blue.button { color: #6495ED; } .yellow.button { color: yellow }</style>`)
})

test('style: does not produce errors', async assert => {
  const { errors, warnings } = await compile(`<style>.foo { color: red; }</style>`)
  assert.deepEqual(errors, [])
  assert.deepEqual(warnings, [])
})

test('style: does not produce errors for an imported component', async assert => {
  const { errors, warnings } = await compile(`
    <import tag from="tags/style/status-attribute.html" />
    <tag />
  `, {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  assert.deepEqual(errors, [])
  assert.deepEqual(warnings, [])
})

test('style: does not produce errors when data tag is present', async assert => {
  const { errors, warnings } = await compile(`
    <import link from="components/link.html"/>
    <import layout from='layouts/default.html'/>
    <data yaml>
    i18n:
      go_to_home:
        pl: Przejdź na stronę główną
        en: Go to homepage
    </data>
    <layout background="purple" {language} {root} {title}>
      <main>
        <div class="purple relative background" padding-top="{100}">
          <div class="status-{status} ui high centered small padded container on mobile">
            <if header>
              <h1 class="white">{header}</h1>
            <end>
            <if content>
              <p class="white">{content}</p>
            <end>
            <link bold alternative underlined headline href="{root}"><translate go_to_home /></link>
          </div>
        </div>
      </main>
    </layout>
    <style>
      div[class*="status-"]::after {
        content: "";
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        background-repeat:  no-repeat;
        background-position: bottom center;
        background-size: contain;
        opacity: 0.1;
      }
      .status-400::after {
        background-image: url('/assets/images/400.svg');
      }
      .status-401::after {
        background-image: url('/assets/images/401.svg');
      }
      .status-403::after {
        background-image: url('/assets/images/403.svg');
      }
      .status-404::after {
        background-image: url('/assets/images/404.svg');
      }
      .status-500::after {
        background-image: url('/assets/images/500.svg');
      }
    </style>
  `, {
    paths: [ join(__dirname, '../../fixtures') ]
  })
  assert.deepEqual(errors, [])
  assert.deepEqual(warnings, [])
})
