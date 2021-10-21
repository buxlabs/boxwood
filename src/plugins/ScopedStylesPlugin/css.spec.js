const test = require('ava')
const { addScopeToCssSelectors } = require('./css')

test('#addScopeToCssSelectors: it works for classes', assert => {
  const result = addScopeToCssSelectors('.foo { color: red }', [])
  assert.deepEqual(result, '.sa52a449f.foo{color:red}')
})

test('#addScopeToCssSelectors: it works for tags', assert => {
  const result = addScopeToCssSelectors('div { color: red }', [])
  assert.deepEqual(result, 'div.safabaa8c{color:red}')
})
