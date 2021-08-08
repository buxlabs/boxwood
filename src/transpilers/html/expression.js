const AbstractSyntaxTree = require('abstract-syntax-tree')
const { unique } = require('pure-utilities/array')
const lexer = require('../../utilities/lexer')
const { BUILT_IN_VARIABLES } = require('../../utilities/enum')

const { ArrayExpression, CallExpression, Identifier, Literal, ObjectPattern, Property, toBinaryExpression } = AbstractSyntaxTree

function isIdentifierGlobal (name) {
  return name === 'undefined' || BUILT_IN_VARIABLES.includes(name)
}

function markNodes (expression) {
  if (!expression) { return }
  if (expression.type === 'Identifier' && !isIdentifierGlobal(expression.name)) {
    expression.parameter = true
  }
  markNodes(expression.left)
  markNodes(expression.right)
  markNodes(expression.argument)
  markNodes(expression.expression)
  markNodes(expression.test)
  markNodes(expression.consequent)
  markNodes(expression.alternate)
  markNodes(expression.callee)
  markNodes(expression.value)
  markNodes(expression.object)
  expression.computed && markNodes(expression.property)
  expression.arguments?.forEach(markNodes)
  expression.properties?.forEach(markNodes)
  expression.elements?.forEach(markNodes)
}

function findParams (body) {
  const tree = new AbstractSyntaxTree(body)
  const nodes = tree.find('Identifier[parameter=true]')
  return unique(nodes.map(node => node.name))
}

function deduceParams (body) {
  const params = findParams(body)
  if (params.length === 0) {
    return []
  }
  return new ObjectPattern({
    properties: params.map(param => {
      const node = new Identifier(param)
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
