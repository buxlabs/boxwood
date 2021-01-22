const test = require('ava')
const { addScopeToCssSelectors } = require('./css')

test('#addScopeToCssSelectors: it works for classes', assert => {
  const result = addScopeToCssSelectors('.foo { color: red }', [])
  assert.deepEqual(result, '.scope-2771010719.foo{color:red}')
})

test('#addScopeToCssSelectors: it works for tags', assert => {
  const result = addScopeToCssSelectors('div { color: red }', [])
  assert.deepEqual(result, 'div.scope-2947263116{color:red}')
})
