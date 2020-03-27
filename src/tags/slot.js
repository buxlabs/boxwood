'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')

module.exports = function ({ fragment, tree, collectChildren }) {
  const ast = new AbstractSyntaxTree('')
  collectChildren(fragment, ast)
  ast.body.forEach(node => tree.append(node))
}
