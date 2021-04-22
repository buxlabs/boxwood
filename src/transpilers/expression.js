const AbstractSyntaxTree = require('abstract-syntax-tree')
const lexer = require('../utilities/lexer')

const { ArrayExpression, CallExpression, Identifier, Literal, ObjectPattern, Property, toBinaryExpression } = AbstractSyntaxTree

function markNodes (expression) {
  if (expression.type === 'Identifier') {
    expression.parameter = true
  }
  if (expression.type === 'MemberExpression' && expression.object.type === 'Identifier') {
    expression.object.parameter = true
  }
  AbstractSyntaxTree.walk(expression, node => {
    if (node.type === 'CallExpression') {
      if (node.callee.type === 'Identifier') {
        node.callee.parameter = true
      }
      node.arguments.forEach(argument => {
        if (argument.type === 'Identifier') {
          argument.parameter = true
        }
      })
    }
  })
}

function findParams (body) {
  const tree = new AbstractSyntaxTree(body)
  const nodes = tree.find('Identifier[parameter=true]')
  return nodes.map(node => node.name)
}

function deduceParams (body) {
  const params = findParams(body)
  if (params.length === 0) {
    return []
  }
  return new ObjectPattern({
    properties: params.map(param => {
      const node = new Identifier({ name: param })
      return new Property({
        key: node,
        value: node,
        kind: 'init',
        computed: false,
        method: false,
        shorthand: true
      })
    })
  })
}

function transpileExpression (source) {
  const tokens = lexer(source)

  const nodes = tokens.map(token => {
    if (token.type === 'expression') {
      const tree = new AbstractSyntaxTree(token.value)
      const { expression } = tree.first('ExpressionStatement')
      markNodes(expression)
      return new CallExpression({
        callee: new Identifier({ name: 'escape' }),
        arguments: [expression]
      })
    }
    if (token.type === 'text') {
      return new Literal({ value: token.value })
    }
    return null
  }).filter(Boolean)

  return toBinaryExpression(new ArrayExpression(nodes))
}

module.exports = { transpileExpression, findParams, markNodes, deduceParams }
