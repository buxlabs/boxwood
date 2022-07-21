const { CallExpression, Identifier, Literal } = require('abstract-syntax-tree')

function getContent (htmlNode) {
  if (htmlNode.children.length > 0) {
    return htmlNode.children[0].content
  }
  return ''
}

module.exports = function styleTag (htmlNode) {
  const content = getContent(htmlNode)
  return new CallExpression({
    callee: new Identifier('tag'),
    arguments: [
      new Literal('style'),
      new Literal(content)
    ].filter(Boolean)
  })
}
