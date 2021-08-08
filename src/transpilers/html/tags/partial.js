const AbstractSyntaxTree = require('abstract-syntax-tree')
const { camelize } = require('pure-utilities/string')
const { findAttributeByKey } = require('../../../utilities/attributes')

const { CallExpression, Identifier } = AbstractSyntaxTree

module.exports = function partial (node) {
  const attribute = findAttributeByKey(node.attributes, 'from')
  const path = attribute.value
  return new CallExpression({
    callee: new Identifier({
      name: `__${camelize(path)}__`,
      partial: true,
      path
    })
  })
}
