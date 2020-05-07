const test = require('ava')
const { inlineLocalVariablesInAttributes } = require('./inline')

test('it inlines square tags', assert => {
  const attribute = { key: 'class', value: '["textarea", class]' }
  const node = { attributes: [attribute] }
  const variables = [{ key: 'class', value: 'foo' }]
  inlineLocalVariablesInAttributes(node, variables)
  assert.deepEqual(attribute.value, "textarea foo")
})
