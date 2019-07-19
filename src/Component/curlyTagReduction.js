const lexer = require('../lexer')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const {
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  memberExpressionReduction,
  ifStatementRemoval
} = require('astoptech')
const { isCurlyTag, getTagValue, curlyTag } = require('../string')
const parse = require('../html/parse')
const stringify = require('../html/stringify')
const walk = require('himalaya-walk')
const { addPlaceholders, removePlaceholders } = require('../keywords')

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
  if (parent.type === 'Property') return node
  if (node.type === 'Identifier') {
    const variable = variables.find(variable => variable.key === node.name)
    if (variable) {
      if (isCurlyTag(variable.value)) {
        const expression = getTagValue(variable.value)
        const tree = new AbstractSyntaxTree(`(${expression})`)
        tree.walk(node => { node.inlined = true })
        return tree.first('ExpressionStatement').expression
      } else {
        return { type: 'Literal', value: variable.value }
      }
    } else {
      if (parent.type === 'BinaryExpression') return
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

function isObject (value) {
  return isCurlyTag(value)
}

function falsyCodeRemoval (node) {
  if (isExpressionStatement(node) && isFalsyNode(node.expression)) {
    return null
  }
  return node
}

function optimizeCurlyTag (value, variables) {
  value = addPlaceholders(value)
  if (isObject(value)) value = `(${value})`
  const tree = new AbstractSyntaxTree(value)
  tree.replace({ enter: removePlaceholders })
  tree.replace({ enter: (node, parent) => inlineVariables(node, parent, variables) })
  tree.replace({ enter: memberExpressionReduction })
  tree.replace({ enter: logicalExpressionReduction })
  tree.replace({ enter: binaryExpressionReduction })
  tree.replace({ enter: ternaryOperatorReduction })
  tree.replace({ enter: ifStatementRemoval })
  tree.replace({ enter: falsyCodeRemoval })
  if (canInlineTree(tree)) {
    const { value } = tree.body[0].expression
    return value
  } else if (!tree.source) {
    return ''
  }
  return curlyTag(tree.source.replace(/;\n$/, ''))
}

const FORBIDDEN_TAGS = ['template', 'script', 'style']
function curlyTagReduction (string, variables) {
  const tree = parse(string)
  walk(tree, node => {
    if (node.forbidden) return
    const { attributes } = node
    if (FORBIDDEN_TAGS.includes(node.tagName)) {
      node.children.forEach(node => {
        node.forbidden = true
      })
    }
    if (node.type === 'text') {
      node.content = optimizeText(node.content, variables)
    } else if (attributes && attributes.length > 0) {
      attributes.forEach(attribute => {
        attribute.value = optimizeText(attribute.value, variables)
      })
      node.attributes = attributes.filter(attribute => attribute.value !== '')
    }
  })
  return stringify(tree, string)
}

function optimizeText (text, variables) {
  if (!text) return text
  let tokens = lexer(text)
  tokens = tokens.map(token => {
    if (token.type === 'expression') {
      token.value = optimizeCurlyTag(token.value, variables)
    }
    return token
  })
  const value = tokens.map(token => token.value).join('')
  return optimizeWhitespace(value)
}

function optimizeWhitespace (text) {
  return text.trim().replace(/\s\s+/, ' ')
}

module.exports = curlyTagReduction
