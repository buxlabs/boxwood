const test = require('ava')
const Compiler = require('./Compiler')
const { join } = require('path')

async function render (input, options) {
  const compiler = new Compiler({
    paths: [
      join(__dirname, '../../../test/fixtures')
    ],
    ...options
  })
  const { template } = await compiler.compile(input.trim())
  return template()
}

test('it compiles html components', async assert => {
  assert.deepEqual(await render(`
    <h1>Hello, world!</h1>
  `, { format: 'html' }), '<h1>Hello, world!</h1>')
})
