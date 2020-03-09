const test = require('ava')
const { inlineLocalVariablesInFragment } = require('./inline')

test('#inlineLocalVariablesInFragment inlines variables in the text', assert => {
  const node = { type: 'text', content: 'hello, {foo}', attributes: [] }
  const variables = [{ key: 'foo', value: 'world' }]
  inlineLocalVariablesInFragment(node, variables)
  assert.deepEqual(node.content, 'hello, world')
})

test('#inlineLocalVariablesInFragment inlines variables in the attribute keys', assert => {
  const node = { type: 'text', content: 'hello', attributes: [{ key: '{foo}' }] }
  const variables = [{ key: 'foo', value: 'world' }]
  inlineLocalVariablesInFragment(node, variables)
  assert.deepEqual(node.attributes, [{ key: 'foo', value: 'world' }])
})
