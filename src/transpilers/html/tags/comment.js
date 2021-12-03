const AbstractSyntaxTree = require('abstract-syntax-tree')

const { Literal } = AbstractSyntaxTree

module.exports = function () {
  return new Literal('')
}
