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

test('findParams: works for call expressions', assert => {
  const params = findParamsInSource(`{bar(baz())}`)
  assert.deepEqual(params, ['bar', 'baz'])
})
