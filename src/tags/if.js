'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getCondition } = require('../utilities/conditions')

module.exports = function ({ fragment, tree, attrs, variables, filters, translations, languages, warnings, depth, collectChildren }) {
  const ast = new AbstractSyntaxTree('')
  collectChildren(fragment, ast)
  const condition = getCondition(attrs, variables, filters, translations, languages, warnings)
  tree.append({
    type: 'IfStatement',
    test: condition,
    consequent: {
      type: 'BlockStatement',
      body: ast.body
    },
    depth
  })
}
