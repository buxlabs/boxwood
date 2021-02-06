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

test('it exposes a css utility method', async assert => {
  assert.deepEqual(await render(`
    const { h1, css } = require('boxwood')

    export default function () {
      return h1({ style: css({ color: 'red' }) }, 'Hello, world!')
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

test('it works with custom js to css fns', async assert => {
  assert.deepEqual(await render(`
    const { h1 } = require('boxwood')

    const css = (strings, ...values) => {
      const rules = strings.reduce((array, string, index) => {
        array.push(string)
        if (values[index]) { array.push(values[index]) }
        return array
      }, [])

      return rules.reduce((object, rule) => {
        const [key, value] = rule.split(':')
        object[key] = value
        return object
      }, {})
    }

    export default function () {
      return h1({ style: css\`color:red\` }, 'Hello, world!')
    }
  `), '<h1 style="color: red">Hello, world!</h1>')
})
