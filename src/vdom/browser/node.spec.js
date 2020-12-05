'use strict'

const test = require('ava')
const node = require('./node')

test('#node: returns an object that does not inherit from an Object', assert => {
  const object = node({ name: 'foo '})
  assert.falsy(object.hasOwnProperty)
})
