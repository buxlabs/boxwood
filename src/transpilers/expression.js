const AbstractSyntaxTree = require('abstract-syntax-tree')
const lexer = require('../utilities/lexer')

const { ArrayExpression, CallExpression, Identifier, Literal, toBinaryExpression } = AbstractSyntaxTree

function transpileExpression (source) {
  const tokens = lexer(source)

  const nodes = tokens.map(token => {
    if (token.type === 'expression') {
      const tree = new AbstractSyntaxTree(token.value)
      const { expression } = tree.first('ExpressionStatement')
      if (expression.type === 'Identifier') {
        expression.parameter = true
      }
      return new CallExpression({
        callee: new Identifier({ name: 'escape' }),
        arguments: [expression]
      })
    }
    if (token.type === 'text') {
      return new Literal({ value: token.value })
    }
    return null
  }).filter(Boolean)

  return toBinaryExpression(new ArrayExpression({ elements: nodes }))
}

module.exports = { transpileExpression }
