const AbstractSyntaxTree = require('abstract-syntax-tree')

const { Identifier } = AbstractSyntaxTree

module.exports = function slotTag (node) {
  return new Identifier({ name: '__children__' })
}
