const lexer = require('../lexer')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const {
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  ifStatementRemoval
} = require('astoptech')

function curlyTagReduction (string, variables) {
  const tokens = lexer(string)

  return tokens
    .map(token => {
      if (token.type === 'expression') {
        const tree = new AbstractSyntaxTree(token.value)
        tree.replace({
          enter: function replaceIdentifiers (node) {
            if (node.type === 'Identifier' && !variables.includes(node.name)) {
              node.name = 'undefined'
            }
            return node
          }
        })

        tree.replace({ enter: logicalExpressionReduction })
        tree.replace({ enter: binaryExpressionReduction })
        tree.replace({ enter: ternaryOperatorReduction })
        tree.replace({ enter: ifStatementRemoval })
        // TODO move the method into astoptech
        tree.replace({
          enter: function deadCodeRemoval (node) {
            if (node.type === 'ExpressionStatement' &&
              (
                node.expression.type === 'Literal' ||
                (node.expression.type === 'Identifier' && ['undefined', 'null', 'Infinity', 'NaN'].includes(node.expression.name))
              )
            ) {
              return null
            }
            return node
          }
        })

        token.type = 'text'
        token.value = tree.source.replace(/;\n$/, '')
      }
      return token
    })
    .map(token => {
      if (token.type === 'expression') {
        return `{${token.value}}`
      }
      return token.value
    })
    .join('')
}

module.exports = curlyTagReduction
