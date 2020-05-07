const test = require('ava')
const { inlineLocalVariablesInAttributes } = require('./inline')

test('it inlines square tags', assert => {
  const attribute = { key: 'class', value: '["textarea", class]' }
  const node = { attributes: [attribute] }
  const variables = [{ key: 'class', value: 'foo' }]
  inlineLocalVariablesInAttributes(node, variables)
  assert.deepEqual(attribute.value, "textarea foo")
})

test('it inlines square tags and removes falsy values', assert => {
  const attribute = { key: 'class', value: '["textarea", class]' }
  const node = { attributes: [attribute] }
  const variables = []
  inlineLocalVariablesInAttributes(node, variables)
  assert.deepEqual(attribute.value, "textarea")
})

test('it inlines square tags and removes falsy values from logical expressions', assert => {
  const attribute = { key: 'class', value: '["textarea", monospaced && "monospaced"]' }
  const node = { attributes: [attribute] }
  const variables = []
  inlineLocalVariablesInAttributes(node, variables)
  assert.deepEqual(attribute.value, "textarea")
})
