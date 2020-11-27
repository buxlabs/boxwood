'use strict'

const test = require('ava')
const diff = require('./diff')

test('#diff', assert => {
  assert.truthy(diff)
})
