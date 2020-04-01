'use strict'

const test = require('ava')
const { inlineLocalVariables } = require('./inline')

test('#inlineLocalVariables inlines variables in the text', assert => {
  const node = { type: 'text', content: 'hello, {foo}', attributes: [] }
  const variables = [{ key: 'foo', value: 'world' }]
  inlineLocalVariables(node, variables)
  assert.deepEqual(node.content, 'hello, world')
})

test('#inlineLocalVariables inlines variables in the attribute keys', assert => {
  const node = { type: 'text', content: 'hello', attributes: [{ key: '{foo}' }] }
  const variables = [{ key: 'foo', value: 'world' }]
  inlineLocalVariables(node, variables)
  assert.deepEqual(node.attributes, [{ key: 'foo', value: 'world' }])
})

test('#inlineLocalVariables inlines variables in the attribute values', assert => {
  const node = { type: 'text', content: 'hello', attributes: [{ key: 'foo', value: '{foo}' }] }
  const variables = [{ key: 'foo', value: 'world' }]
  inlineLocalVariables(node, variables)
  assert.deepEqual(node.attributes, [{ key: 'foo', value: 'world' }])
})
