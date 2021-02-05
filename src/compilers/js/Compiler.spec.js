const test = require('ava')
const Compiler = require('./Compiler')

async function render (input) {
  const compiler = new Compiler({ paths: [] })
  const { template } = await compiler.compile(input)
  return template()
}

test('it compiles js components', async assert => {
  assert.deepEqual(await render(`
    const { h1 } = require('boxwood')

    export default function () {
      return h1('Hello, world!')
    }
  `), '<h1>Hello, world!</h1>')
})

test('it works with a style attribute', async assert => {
  assert.deepEqual(await render(`
    const { h1 } = require('boxwood')

    export default function () {
      return h1({ style: 'color:red' }, 'Hello, world!')
    }
  `), '<h1 style="color:red">Hello, world!</h1>')
})

test('it exposes a styles utility method', async assert => {
  assert.deepEqual(await render(`
    const { h1, styles } = require('boxwood')

    export default function () {
      return h1({ style: styles({ color: 'red' }) }, 'Hello, world!')
    }
  `), '<h1 style="color: red">Hello, world!</h1>')
})

test('it exposes a style tag ', async assert => {
  assert.deepEqual(await render(`
    const { h1, style } = require('boxwood')

    export default function () {
      return [
        h1('Hello, world!'),
        style('h1 { color: red }')
      ]
    }
  `), '<h1>Hello, world!</h1><style>h1 { color: red }</style>')
})
