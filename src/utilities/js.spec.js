const test = require('ava')
const { concatenateScripts } = require('./js')

test('it does not modify one script', async assert => {
  const output = concatenateScripts(['const foo = "bar"'])
  assert.deepEqual(output, 'const foo = "bar"')
})

test('it adds a colon between two scripts', async assert => {
  const output = concatenateScripts([
    'const foo = "bar"',
    'const baz = "qux"'
  ])
  assert.deepEqual(output, 'const foo = "bar";const baz = "qux"')
})

test('does not add a colon if it is unnecessary', async assert => {
  const output = concatenateScripts([
    'const foo = "bar";',
    'const baz = "qux"'
  ])
  assert.deepEqual(output, 'const foo = "bar";const baz = "qux"')
})
