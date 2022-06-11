const AbstractSyntaxTree = require('abstract-syntax-tree')
const { unique } = require('pure-utilities/array')
const lexer = require('./lexers/html')
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

function findChildren (body) {
  const tree = new AbstractSyntaxTree(body)
  const node = tree.first('Identifier[name="__children__"]')
  return node
}

function deduceParams (body) {
  const params = findParams(body)
  const children = findChildren(body)
  return [
    params.length > 0
      ? new ObjectPattern({
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
      : children && new Identifier('__UNUSED_PARAM__'),
    children
  ].filter(Boolean)
}

function normalizeTokenValue (value) {
  if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
    return `(${value})`
  }
  return value
}

function transpileExpression (source, escape = true) {
  const tokens = lexer(source)
  const nodes = tokens.map(token => {
    if (token.type === 'square') {
      token.type = 'curly'
      token.value = `[${token.value}].filter(node => !!node).join(' ')`
    }
    if (token.type === 'curly') {
      token.value = normalizeTokenValue(token.value)
      const tree = new AbstractSyntaxTree(token.value)
      const { expression } = tree.first('ExpressionStatement')
      markNodes(expression)
      if (expression.type === 'Literal' && typeof expression.value === 'string') {
        return expression
      }
      if (escape) {
        return new CallExpression({
          callee: new Identifier({ name: 'escape' }),
          arguments: [expression]
        })
      } else {
        return expression
      }
    }
    if (token.type === 'text') {
      return new Literal({ value: token.value })
    }
    return null
  }).filter(Boolean)

  return toBinaryExpression(new ArrayExpression(nodes))
}

module.exports = { transpileExpression, findParams, markNodes, deduceParams }
