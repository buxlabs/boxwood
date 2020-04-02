'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')

module.exports = function ({ fragment, tree, depth, collectChildren }) {
  let leaf = tree.last(`IfStatement[depth="${depth}"]`) || tree.last(`IfStatement[depth="${depth + 1}"]`)
  if (leaf) {
    const ast = new AbstractSyntaxTree('')
    collectChildren(fragment, ast)
    while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
      leaf = leaf.alternate
    }
    leaf.alternate = {
      type: 'BlockStatement',
      body: ast.body
    }
  }
}
