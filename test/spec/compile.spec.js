const test = require('ava')
const { compile } = require('../../')

test('compile: it returns a template', async assert => {
  const { template } = await compile(`
    module.exports = () => "foo"
  `)

  assert.deepEqual(template(), "foo")
})
