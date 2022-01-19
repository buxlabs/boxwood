'use strict'

const test = require('ava')
const tokenize = require('./html')

test('tokenize: returns tokens', assert => {
  assert.deepEqual(tokenize('foo'), [['data', 'foo', {}]])
  assert.deepEqual(tokenize('<br>'), [['data', ''], ['startTagStart', '<'], ['tagName', 'br'], ['tagEnd', '>']])
})

test('tokenize: works correctly for script with angle brackets', assert => {
  assert.deepEqual(tokenize('<script>if (foo < 42) {}</script>'), [
    ['data', ''],
    ['startTagStart', '<'],
    ['tagName', 'script'],
    ['tagEnd', '>'],
    ['rawtext', 'if (foo < 42) {}'],
    ['endTagStart', '</script'],
    ['tagEnd', '>'],
    ['data', '', {}]
  ])
})

test('tokenize: works correctly for style with angle brackets', assert => {
  assert.deepEqual(tokenize('<style>.foo { content: "<"; }</style>'), [
    ['data', ''],
    ['startTagStart', '<'],
    ['tagName', 'style'],
    ['tagEnd', '>'],
    ['rawtext', '.foo { content: "<"; }'],
    ['endTagStart', '</style'],
    ['tagEnd', '>'],
    ['data', '', {}]
  ])
})
