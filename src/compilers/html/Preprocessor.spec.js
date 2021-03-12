'use strict'

const test = require('ava')
const Preprocessor = require('./Preprocessor')
const { parse, stringify } = require('../../utilities/html')

test('Preprocessor: puts scoped styles in the head tag', async assert => {
  const preprocessor = new Preprocessor()
  const html = `
    <html>
      <head>
        <title>foo</title>
      </head>
      <body>
        <div class="foo"></div>
      </body>
    </html>

    <style scoped>
      .foo {
        color: red;
      }
    </style>
  `
  const tree = parse(html)
  const output = await preprocessor.preprocess(tree)
  const code = stringify(output, html)
  assert.deepEqual(code.trim(), `
    <html>
      <head>
        <title>foo</title>
      <style>.scope-2387775620.foo{color:red}</style></head>
      <body>
        <div class='scope-2387775620 foo'></div>
      </body>
    </html>
  `.trim())
})
