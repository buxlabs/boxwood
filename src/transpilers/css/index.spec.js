'use strict'

const test = require('ava')
const { transpile } = require('.')

test('transpile: simple class', assert => {
  assert.deepEqual(transpile('.foo { color: red }'), `.foo-2771010719{color:red}`)
})
