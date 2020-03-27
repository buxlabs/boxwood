'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')

module.exports = function ({ fragment, tree, collectChildren }) {
  const leaf = tree.last('SwitchStatement')
  if (leaf) {
    const ast = new AbstractSyntaxTree('')
    collectChildren(fragment, ast)
    ast.append({
      type: 'BreakStatement',
      label: null
    })
    leaf.cases.push({
      type: 'SwitchCase',
      consequent: ast.body,
      test: null
    })
  }
}
