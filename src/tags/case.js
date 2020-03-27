'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { OPERATORS } = require('../utilities/enum')
const { getCondition } = require('../utilities/conditions')

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
    ast.append({
      type: 'BreakStatement',
      label: null
    })
    leaf.cases.push({
      type: 'SwitchCase',
      consequent: ast.body,
      test: condition
    })
  }
}
