const AbstractSyntaxTree = require('abstract-syntax-tree')
const { camelize } = require('pure-utilities/string')
const { findAttributeByKey } = require('../../../utilities/attributes')

const { CallExpression, Identifier } = AbstractSyntaxTree

function pathToIdentifier (path) {
  return `__${camelize(path.replace(/\./g, 'Dot_').replace(/\//g, 'Slash_'))}__`
}

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
