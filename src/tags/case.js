'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { OPERATORS } = require('../utilities/enum')
const { getCondition } = require('../utilities/conditions')

const { BreakStatement, SwitchCase } = AbstractSyntaxTree

module.exports = function ({ fragment, tree, attrs, variables, collectChildren }) {
  const leaf = tree.last('SwitchStatement')
  if (leaf) {
    const attributes = [leaf.attribute]
    attrs.forEach(attr => {
      attributes.push(attr)
      if (OPERATORS.includes(attr.key)) {
        attributes.push(leaf.attribute)
      }
    })
    const condition = getCondition(attributes, variables)
    const ast = new AbstractSyntaxTree('')
    collectChildren(fragment, ast)
    ast.append(new BreakStatement())
    leaf.cases.push(new SwitchCase({
      consequent: ast.body,
      test: condition
    }))
  }
}
