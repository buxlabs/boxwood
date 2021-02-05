const test = require('ava')
const Compiler = require('./Compiler')

test('it compiles js components', async assert => {
  const compiler = new Compiler({ paths: [] })
  const { template } = await compiler.compile(`
    const { h1 } = require('boxwood')

    export default function () {
      return h1('Hello, world!')
    }
  `)
  assert.deepEqual(template(), '<h1>Hello, world!</h1>')
})
