const AbstractSyntaxTree = require('abstract-syntax-tree')

module.exports = function doctype () {
  const [node] = AbstractSyntaxTree.template('tag("!DOCTYPE", { html: true })', {})
  return node.expression
}
