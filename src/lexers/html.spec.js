'use strict'

const test = require('ava')
const tokenize = require('./html')

test('tokenize: returns tokens', assert => {
  assert.deepEqual(tokenize('foo'), [['data', 'foo', {}]])
  assert.deepEqual(tokenize('<br>'), [['data', ''], ['startTagStart', '<'], ['tagName', 'br'], ['tagEnd', '>']])
})
