const lexer = require('../lexer')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const {
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  memberExpressionReduction,
  ifStatementRemoval
} = require('astoptech')
const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')

function canInlineTree ({ body }) {
  const statement = body[0]
  return body.length === 1 &&
    isExpressionStatement(statement) &&
    isLiteral(statement.expression) &&
    typeof statement.expression.value === 'string'
}

function inlineVariables (node, parent, variables) {
  if (node.inlined) return node
  if (parent.type === 'MemberExpression' && node === parent.property) return node

  if (node.type === 'Identifier') {
    const variable = variables.find(variable => variable.key === node.name)
    if (variable) {
      if (isCurlyTag(variable.value)) {
        const expression = getExpressionFromCurlyTag(variable.value)
        const tree = new AbstractSyntaxTree(`(${expression})`)
        tree.walk(node => { node.inlined = true })
        return tree.first('ExpressionStatement').expression
      } else {
        return { type: 'Literal', value: variable.value }
      }
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

function isEmptyString (node) {
  return isLiteral(node) && node.value === ''
}

function isUndefined (node) {
  return isIdentifier(node) && node.name === 'undefined'
}

function isFalsyNode (node) {
  return isEmptyString(node) || isUndefined(node)
}

function falsyCodeRemoval (node) {
  if (isExpressionStatement(node) && isFalsyNode(node.expression)) {
    return null
  }
  return node
}

function optimizeExpressionToken (token, variables) {
  const tree = new AbstractSyntaxTree(token.value)
  tree.replace({ enter: (node, parent) => inlineVariables(node, parent, variables) })
  tree.replace({ enter: memberExpressionReduction })
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

  // TODO this might break tags on e.g.
  // <style>.foo{color:red}</style>
  // <script>const foo = {}</script>
  // etc.
  // we might need to traverse through the tree instead of
  // relying on the lexer only
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
