'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getCatchClause } = require('../utilities/factory')

module.exports = function ({ fragment, tree, collectChildren }) {
  const leaf = tree.last('TryStatement')
  if (leaf) {
    const ast = new AbstractSyntaxTree('')
    collectChildren(fragment, ast)
    leaf.handler = getCatchClause(ast.body)
  }
}
