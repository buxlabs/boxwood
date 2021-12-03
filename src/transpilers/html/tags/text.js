const { transpileExpression } = require('../expression')

module.exports = function (htmlNode) {
  const { content } = htmlNode
  return transpileExpression(content)
}
