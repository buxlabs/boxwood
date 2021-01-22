const test = require('ava')
const { addScopeToCssSelectors } = require('./css')

test('#addScopeToCssSelectors: it adds a scope based on a hash', assert => {
  const result = addScopeToCssSelectors('.foo { color: red }', [])
  assert.deepEqual(result, '.scope-2771010719.foo{color:red}')
})
