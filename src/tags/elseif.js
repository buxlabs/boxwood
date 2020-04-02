'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getCondition } = require('../utilities/conditions')

module.exports = function ({ fragment, tree, attrs, variables, filters, translations, languages, warnings, depth, collectChildren }) {
  let leaf = tree.last(`IfStatement[depth="${depth}"]`) || tree.last(`IfStatement[depth="${depth + 1}"]`)
  if (leaf) {
    const ast = new AbstractSyntaxTree('')
    collectChildren(fragment, ast)
    while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
      leaf = leaf.alternate
    }
    const condition = getCondition(attrs, variables, filters, translations, languages, warnings)
    leaf.alternate = {
      type: 'IfStatement',
      test: condition,
      consequent: {
        type: 'BlockStatement',
        body: ast.body
      },
      depth
    }
  }
}
