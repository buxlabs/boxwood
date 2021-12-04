const AbstractSyntaxTree = require('abstract-syntax-tree')
const { findAttributeByKey } = require('../../../utilities/attributes')
const { pathToIdentifier } = require('../utilities/path')

const { CallExpression, Identifier } = AbstractSyntaxTree

module.exports = function partial (node) {
  const attribute = findAttributeByKey(node.attributes, 'from')
  const path = attribute.value
  return new CallExpression({
    callee: new Identifier({
      name: pathToIdentifier(path),
      partial: true,
      path
    })
  })
}
