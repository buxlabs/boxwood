'use strict'

const test = require('ava')
const tokenize = require('./html')

test('tokenize: returns tokens', assert => {
  assert.deepEqual(tokenize('foo'), [{ type: 'text', value: 'foo' }])
  assert.deepEqual(tokenize('bar'), [{ type: 'text', value: 'bar' }])
  assert.deepEqual(tokenize('{foo}'), [{ type: 'expression', value: 'foo' }])
  assert.deepEqual(tokenize('{bar}'), [{ type: 'expression', value: 'bar' }])
  assert.deepEqual(tokenize('foo bar'), [{ type: 'text', value: 'foo bar' }])
  assert.deepEqual(tokenize('foo {bar}'), [{ type: 'text', value: 'foo ' }, { type: 'expression', value: 'bar' }])
  assert.deepEqual(tokenize('{foo} bar'), [{ type: 'expression', value: 'foo' }, { type: 'text', value: ' bar' }])
  assert.deepEqual(tokenize('{foo} {bar}'), [{ type: 'expression', value: 'foo' }, { type: 'text', value: ' ' }, { type: 'expression', value: 'bar' }])
  assert.deepEqual(tokenize('foo bar {baz}'), [{ type: 'text', value: 'foo bar ' }, { type: 'expression', value: 'baz' }])
  assert.deepEqual(tokenize('foo {bar} baz'), [{ type: 'text', value: 'foo ' }, { type: 'expression', value: 'bar' }, { type: 'text', value: ' baz' }])
  assert.deepEqual(tokenize('foo     bar'), [{ type: 'text', value: 'foo     bar' }])
  assert.deepEqual(tokenize('   foo     bar    '), [{ type: 'text', value: '   foo     bar    ' }])
  assert.deepEqual(tokenize('foo-{bar}'), [{ type: 'text', value: 'foo-' }, { type: 'expression', value: 'bar' }])
  assert.deepEqual(tokenize('{foo}-{bar}'), [{ type: 'expression', value: 'foo' }, { type: 'text', value: '-' }, { type: 'expression', value: 'bar' }])
  assert.deepEqual(tokenize('{foo | uppercase}'), [{ type: 'expression', value: 'foo | uppercase' }])
  assert.deepEqual(tokenize('{foo | uppercase | lowercase}'), [{ type: 'expression', value: 'foo | uppercase | lowercase' }])
  assert.deepEqual(tokenize('{foo | uppercase | lowercase | truncate(25)}'), [{ type: 'expression', value: 'foo | uppercase | lowercase | truncate(25)' }])
  assert.deepEqual(tokenize('{1}'), [{ type: 'expression', value: '1' }])
  assert.deepEqual(tokenize('{"foo"}'), [{ type: 'expression', value: '"foo"' }])
  assert.deepEqual(tokenize('{foo || bar}'), [{ type: 'expression', value: 'foo || bar' }])
  assert.deepEqual(tokenize('/foo/{bar | first}'), [{ type: 'text', value: '/foo/' }, { type: 'expression', value: 'bar | first' }])
  assert.deepEqual(tokenize('{foo | bar({baz: 25}) | monetize({ currency: "$", ending: false, space: false })}'), [{ type: 'expression', value: 'foo | bar({baz: 25}) | monetize({ currency: "$", ending: false, space: false })' }])
  assert.deepEqual(tokenize('{foo | monetize({ currency: "$", ending: false, space: false })}'), [{ type: 'expression', value: 'foo | monetize({ currency: "$", ending: false, space: false })' }])
})

test('tokenize: handles template literals', assert => {
  assert.deepEqual(tokenize('{`${user.firstName}, ${user.lastName}`}'), [{ type: 'expression', value: '`${user.firstName}, ${user.lastName}`' }])
})
