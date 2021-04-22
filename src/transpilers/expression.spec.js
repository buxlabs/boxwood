const test = require('ava')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { markNodes, findParams } = require('./expression')
const lexer = require('../utilities/lexer')

function findParamsInSource (source) {
  const tokens = lexer(source)
  return tokens.reduce((result, token) => {
    if (token.type === 'expression') {
      const tree = new AbstractSyntaxTree(token.value)
      const { expression } = tree.first('ExpressionStatement')
      markNodes(expression)
      return [...result, ...findParams(expression)]
    }
    return result
  }, [])
}

test('findParams: works for multiple params', assert => {
  const params = findParamsInSource(`{foo} {bar}`)
  assert.deepEqual(params, ['foo', 'bar'])
})

test('findParams: works for member expressions', assert => {
  const params = findParamsInSource(`{foo.bar}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for computed member expressions', assert => {
  const params = findParamsInSource(`{foo[bar]}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for a member expression with call expression as the object', assert => {
  const params = findParamsInSource(`{foo().bar}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for a member expression with call expression as the property', assert => {
  const params = findParamsInSource(`{foo.bar()}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for call expressions', assert => {
  const params = findParamsInSource(`{bar(baz())}`)
  assert.deepEqual(params, ['bar', 'baz'])
})

test('findParams: works for call expressions with member expressions', assert => {
  const params = findParamsInSource(`{bar(baz.qux())}`)
  assert.deepEqual(params, ['bar', 'baz'])
})

test('findParams: works for complex call expressions', assert => {
  const params = findParamsInSource(`{foo.bar(baz.qux())}`)
  assert.deepEqual(params, ['foo', 'baz'])
})

test('findParams: works for deeply nested expressions', assert => {
  const params = findParamsInSource(`{foo.bar().baz}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for deeply nested expressions with params', assert => {
  const params = findParamsInSource(`{foo.bar(qux, quux).baz}`)
  assert.deepEqual(params, ['foo', 'qux', 'quux'])
})

test('findParams: works for binary expressions', assert => {
  const params = findParamsInSource(`{foo + bar}`)
  assert.deepEqual(params, ['foo', 'bar'])
})

test('findParams: works for complex binary expressions', assert => {
  const params = findParamsInSource(`{foo.bar + baz.qux}`)
  assert.deepEqual(params, ['foo', 'baz'])
})

test('findParams: works for unary expressions', assert => {
  const params = findParamsInSource(`{!foo}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for complex unary expressions', assert => {
  const params = findParamsInSource(`{!foo.bar}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for update expressions', assert => {
  const params = findParamsInSource(`{++foo}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for nested update expressions', assert => {
  const params = findParamsInSource(`{foo.bar++}`)
  assert.deepEqual(params, ['foo'])
})

test('findParams: works for chain expressions', assert => {
  const params = findParamsInSource('{bar?.qux}')
  assert.deepEqual(params, ['bar'])
})

test('findParams: works for nested chain expressions', assert => {
  const params = findParamsInSource('{qux.baz?.bar}')
  assert.deepEqual(params, ['qux'])
})
