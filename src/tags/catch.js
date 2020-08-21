'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')

const { CatchClause, Identifier, BlockStatement } = AbstractSyntaxTree

module.exports = function ({ fragment, tree, collectChildren }) {
  const leaf = tree.last('TryStatement')
  if (leaf) {
    const ast = new AbstractSyntaxTree('')
    collectChildren(fragment, ast)
    leaf.handler = new CatchClause({
      param: new Identifier({ name: 'exception' }),
      body: new BlockStatement({ body: ast.body })
    })
  }
}
