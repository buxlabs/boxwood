const AbstractSyntaxTree = require('abstract-syntax-tree')

const { Literal } = AbstractSyntaxTree

module.exports = function importTag (node) {
  return new Literal({ value: null })
}
