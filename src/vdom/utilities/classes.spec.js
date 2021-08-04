'use strict'

const test = require('ava')
const classes = require('./classes')

test('classes: returns a string if a string was passed', assert => {
  assert.deepEqual(classes('foo'), 'foo')
})

test('classes: returns a string if two strings were passed', assert => {
  assert.deepEqual(classes('foo', 'bar'), 'foo bar')
})

test('classes: works for a single object', assert => {
  assert.deepEqual(classes({ foo: true, bar: false }), 'foo')
})
