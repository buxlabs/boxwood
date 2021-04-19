'use strict'

const test = require('ava')
const { findAttributeByKey, removeAttributeByKey } = require('./attributes')

test('findAttributeByKey: attribute is present', assert => {
  const attributes = [{ key: 'style', value: 'height: 50px' }]
  const attribute = findAttributeByKey(attributes, 'style')
  assert.deepEqual(attribute, attributes[0])
})

test('findAttributeByKey: attribute is not present', assert => {
  const attributes = []
  const attribute = findAttributeByKey(attributes, 'style')
  assert.deepEqual(attribute, undefined)
})

test('findAttributeByKey: attributes are not present', assert => {
  const attribute = findAttributeByKey(undefined, 'style')
  assert.deepEqual(attribute, undefined)
})

test('removeAttributeByKey: removes given attribute', assert => {
  const attributes = [{ key: 'style', value: 'height: 50px' }]
  removeAttributeByKey(attributes, 'style')
  assert.deepEqual(attributes, [])
})

test('removeAttributeByKey: attributes are not present', assert => {
  assert.notThrows(() => {
    removeAttributeByKey(undefined, 'style')
  })
})
