const lexer = require('../lexer')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const {
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  ifStatementRemoval
} = require('astoptech')

function canInlineTree ({ body }) {
  const statement = body[0]
  return body.length === 1 &&
    isExpressionStatement(statement) &&
    isLiteral(statement.expression)
}

function inlineVariables (node, variables) {
  if (node.type === 'Identifier' && !variables.includes(node.name)) {
    const variable = variables.find(variable => variable.key === node.name)
    if (variable) {
      return { type: 'Literal', value: variable.value }
    } else {
      node.name = 'undefined'
    }
  }
  return node
}

function isLiteral (node) {
  return node.type === 'Literal'
}

function isIdentifier (node) {
  return node.type === 'Identifier'
}

function isExpressionStatement (node) {
  return node.type === 'ExpressionStatement'
}

function isFalsyLiteral (node) {
  return isLiteral(node) && !node.value
}

function isUndefined (node) {
  return isIdentifier(node) && node.name === 'undefined'
}

function isFalsyNode (node) {
  return isFalsyLiteral(node) || isUndefined(node)
}

function falsyCodeRemoval (node) {
  if (isExpressionStatement(node) && isFalsyNode(node.expression)) {
    return null
  }
  return node
}

function optimizeExpressionToken (token, variables) {
  const tree = new AbstractSyntaxTree(token.value)
  tree.replace({ enter: node => inlineVariables(node, variables) })
  tree.replace({ enter: logicalExpressionReduction })
  tree.replace({ enter: binaryExpressionReduction })
  tree.replace({ enter: ternaryOperatorReduction })
  tree.replace({ enter: ifStatementRemoval })
  tree.replace({ enter: falsyCodeRemoval })

  if (canInlineTree(tree)) {
    token.type = 'text'
    token.value = tree.body[0].expression.value
  } else if (!tree.source) {
    return null
  } else {
    const value = tree.source.replace(/;\n$/, '')
    token.value = `${value}`
  }
  return token
}

function curlyTagReduction (string, variables) {
  const tokens = lexer(string)

  return tokens
    .map(token => {
      if (token.type === 'expression') {
        return optimizeExpressionToken(token, variables)
      }
      return token
    })
    .filter(Boolean)
    .map(token => {
      if (token.type === 'expression') {
        return `{${token.value}}`
      }
      return token.value
    })
    .join('')
}

module.exports = curlyTagReduction
