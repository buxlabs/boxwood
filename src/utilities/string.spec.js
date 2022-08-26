'use strict'

const test = require('ava')
const { dasherize, hyphenate, getExtension, hash } = require('./string')

test('dasherize: replaces dots with dashes', assert => {
  assert.deepEqual(dasherize('foo.bar'), 'foo-bar')
})

test('hyphenate: converts characters to lowercase and prepends a dash', assert => {
  assert.deepEqual(hyphenate('fooBar'), 'foo-bar')
})

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
