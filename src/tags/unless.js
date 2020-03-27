'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { convertKey } = require('../utilities/convert')

module.exports = function ({ fragment, tree, attrs, variables, depth, collectChildren }) {
  const ast = new AbstractSyntaxTree('')
  collectChildren(fragment, ast)
  const { key } = attrs[0]
  tree.append({
    type: 'IfStatement',
    test: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: convertKey(key, variables)
    },
    consequent: {
      type: 'BlockStatement',
      body: ast.body
    },
    depth
  })
}
