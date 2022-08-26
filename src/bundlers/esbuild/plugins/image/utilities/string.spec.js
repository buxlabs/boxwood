'use strict'

const test = require('ava')
const { getExtension } = require('./string')

test('getExtension: returns the extension of the file', assert => {
  assert.deepEqual(getExtension('index'), '')
  assert.deepEqual(getExtension('index.html'), 'html')
})
