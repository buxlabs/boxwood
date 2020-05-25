const test = require('ava')
const { inlineLocalVariablesInAttributes } = require('./inline')

test('curly tags: it inlines strings', assert => {
  const attribute = { key: 'class', value: '{class}' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'class', value: 'foo' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'foo')
})

test('curly tags: it inlines truthy booleans', assert => {
  const attribute = { key: 'class', value: '{foo && "foo"}' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'foo', value: '{true}' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'foo')
})

test('curly tags: it inlines falsy booleans in', assert => {
  const attribute = { key: 'class', value: '{foo || "bar"}' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'foo', value: '{false}' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'bar')
})

test.skip('curly tags: it inlines truthy booleans in a ternary if', assert => {
  const attribute = { key: 'class', value: '{foo ? "foo" : "bar"}' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'foo', value: '{true}' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'foo')
})

test.skip('curly tags: it inlines falsy booleans in a ternary if', assert => {
  const attribute = { key: 'class', value: '{foo ? "foo" : "bar"}' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'foo', value: '{false}' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'bar')
})

// TODO add specs for booleans in curly tags
// TODO add specs for empty curly tag value
// TODO add specs for if/else etc.
// TODO add specs for for/foreach/each

test('it inlines curly tags with strings', assert => {
  const attribute = { key: 'class', value: '{class + "-bar"}' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'class', value: 'foo' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'foo-bar')
})

test('it inlines square tags', assert => {
  const attribute = { key: 'class', value: '["textarea", class]' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'class', value: 'foo' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'textarea foo')
})

test('it inlines square tags and removes falsy values', assert => {
  const attribute = { key: 'class', value: '["textarea", class]' }
  const node = { attributes: [attribute] }
  const localVariables = []
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'textarea')
})

test('it inlines square tags and removes falsy values from logical expressions', assert => {
  const attribute = { key: 'class', value: '["textarea", monospaced && "monospaced"]' }
  const node = { attributes: [attribute] }
  const localVariables = []
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'textarea')
})

test('it inlines square tags and handles truthy boolean values', assert => {
  const attribute = { key: 'class', value: '["textarea", class, foo && "foo"]' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'foo', value: '{true}' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, 'textarea foo')
})

test('it inlines square tags and handles falsy boolean values', assert => {
  const attribute = { key: 'class', value: '["textarea", class, foo && "foo"]' }
  const node = { attributes: [attribute] }
  const localVariables = [{ key: 'foo', value: '{false}' }]
  const variables = []
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, "textarea")
})

test('it does not set the variable to undefined if it is a global variable', assert => {
  const attribute = { key: 'class', value: '["textarea", foo]' }
  const node = { attributes: [attribute] }
  const localVariables = []
  const variables = ['foo']
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, '["textarea", foo]')
})

test('it does not set the variable to undefined if it is a global variable with a keyword name', assert => {
  const attribute = { key: 'class', value: '["textarea", class]' }
  const node = { attributes: [attribute] }
  const localVariables = []
  const variables = ['class']
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  assert.deepEqual(attribute.value, '["textarea", class]')
})
