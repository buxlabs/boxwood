'use strict'

const test = require('ava')
const { getExtension, hash } = require('./string')

test('getExtension: returns the extension of the file', assert => {
  assert.deepEqual(getExtension('index'), '')
  assert.deepEqual(getExtension('index.html'), 'html')
})

test('hash: returns a hash', assert => {
  assert.deepEqual(hash(''), '')
  assert.deepEqual(hash(undefined), '')
  assert.deepEqual(hash(null), '')
  assert.deepEqual(hash('foo'), 'sb875c63')
})
