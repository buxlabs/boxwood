'use strict'

const test = require('ava')
const { normalizeErrors } = require('./errors')

test('it returns an empty string if the error has no stack trace', assert => {
  const input = { type: 'FOO_BAZ', message: 'bar' }
  const output = normalizeErrors(input)
  assert.deepEqual(output, { type: 'FOO_BAZ', message: 'bar', stack: '' })
})
