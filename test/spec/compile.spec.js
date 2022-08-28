const test = require('ava')
const { compile } = require('../../')

test('compile: it returns a template', async assert => {
  const { template } = await compile(`
    module.exports = () => "foo"
  `)

  assert.deepEqual(template(), "foo")
})

test('compile: it returns a template which can have parameters', async assert => {
  const { template } = await compile(`
    module.exports = ({ foo }) => foo
  `)

  assert.deepEqual(template({ foo: 'bar' }), "bar")
})

test('compile: it returns a template which can require dependencies', async assert => {
  const { template } = await compile(`
    const { join } = require('path')

    module.exports = () => join('foo', 'bar')
  `)

  assert.deepEqual(template(), 'foo/bar')
})
