'use strict'

const test = require('ava')
const tokenize = require('./html')

test('tokenize: returns tokens', assert => {
  assert.deepEqual(tokenize('foo'), [{ type: 'text', value: 'foo' }])
  assert.deepEqual(tokenize('bar'), [{ type: 'text', value: 'bar' }])
  assert.deepEqual(tokenize('{foo}'), [{ type: 'curly', value: 'foo' }])
  assert.deepEqual(tokenize('{bar}'), [{ type: 'curly', value: 'bar' }])
  assert.deepEqual(tokenize('foo bar'), [{ type: 'text', value: 'foo bar' }])
  assert.deepEqual(tokenize('foo {bar}'), [{ type: 'text', value: 'foo ' }, { type: 'curly', value: 'bar' }])
  assert.deepEqual(tokenize('{foo} bar'), [{ type: 'curly', value: 'foo' }, { type: 'text', value: ' bar' }])
  assert.deepEqual(tokenize('{foo} {bar}'), [{ type: 'curly', value: 'foo' }, { type: 'text', value: ' ' }, { type: 'curly', value: 'bar' }])
  assert.deepEqual(tokenize('foo bar {baz}'), [{ type: 'text', value: 'foo bar ' }, { type: 'curly', value: 'baz' }])
  assert.deepEqual(tokenize('foo {bar} baz'), [{ type: 'text', value: 'foo ' }, { type: 'curly', value: 'bar' }, { type: 'text', value: ' baz' }])
  assert.deepEqual(tokenize('foo     bar'), [{ type: 'text', value: 'foo     bar' }])
  assert.deepEqual(tokenize('   foo     bar    '), [{ type: 'text', value: '   foo     bar    ' }])
  assert.deepEqual(tokenize('foo-{bar}'), [{ type: 'text', value: 'foo-' }, { type: 'curly', value: 'bar' }])
  assert.deepEqual(tokenize('{foo}-{bar}'), [{ type: 'curly', value: 'foo' }, { type: 'text', value: '-' }, { type: 'curly', value: 'bar' }])
  assert.deepEqual(tokenize('{foo | uppercase}'), [{ type: 'curly', value: 'foo | uppercase' }])
  assert.deepEqual(tokenize('{foo | uppercase | lowercase}'), [{ type: 'curly', value: 'foo | uppercase | lowercase' }])
  assert.deepEqual(tokenize('{foo | uppercase | lowercase | truncate(25)}'), [{ type: 'curly', value: 'foo | uppercase | lowercase | truncate(25)' }])
  assert.deepEqual(tokenize('{1}'), [{ type: 'curly', value: '1' }])
  assert.deepEqual(tokenize('{"foo"}'), [{ type: 'curly', value: '"foo"' }])
  assert.deepEqual(tokenize('{foo || bar}'), [{ type: 'curly', value: 'foo || bar' }])
  assert.deepEqual(tokenize('/foo/{bar | first}'), [{ type: 'text', value: '/foo/' }, { type: 'curly', value: 'bar | first' }])
  assert.deepEqual(tokenize('{foo | bar({baz: 25}) | monetize({ currency: "$", ending: false, space: false })}'), [{ type: 'curly', value: 'foo | bar({baz: 25}) | monetize({ currency: "$", ending: false, space: false })' }])
  assert.deepEqual(tokenize('{foo | monetize({ currency: "$", ending: false, space: false })}'), [{ type: 'curly', value: 'foo | monetize({ currency: "$", ending: false, space: false })' }])
})

test('tokenize: handles template literals', assert => {
  assert.deepEqual(tokenize('{`${user.firstName}, ${user.lastName}`}'), [{ type: 'curly', value: '`${user.firstName}, ${user.lastName}`' }])
})

test('tokenize: handles array syntax', assert => {
  assert.deepEqual(tokenize('[foo]'), [{ type: 'square', value: 'foo' }])
})
