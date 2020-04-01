'use strict'

const lexer = require('../utilities/lexer')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const {
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  memberExpressionReduction,
  ifStatementRemoval
} = require('astoptech')
const { isCurlyTag, getTagValue, curlyTag } = require('../utilities/string')
const { parse, stringify } = require('../utilities/html')
const { inlineLocalVariablesInTags } = require('../utilities/inline')
const walk = require('himalaya-walk')
const { addPlaceholders, removePlaceholders } = require('../utilities/keywords')
const { GLOBAL_VARIABLE } = require('../utilities/enum')

function canInlineTree ({ body }) {
  const statement = body[0]
  return body.length === 1 &&
    isExpressionStatement(statement) &&
    isLiteral(statement.expression) &&
    typeof statement.expression.value === 'string'
}

function inlineVariables (node, parent, variables, newVariables) {
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
      const variable = newVariables.find(variable => variable.key === node.name)
      if (!variable) {
        if (parent.type === 'BinaryExpression') return
        node.name = 'undefined'
      }
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

function undefinedOptionsRemoval (node) {
  if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'undefined') {
    return null
  }
  return node
}

function isGlobalVariable (tree) {
  const node = tree.body[0]
  return node.type === 'ExpressionStatement' &&
    node.expression.type === 'MemberExpression' &&
    node.expression.object.type === 'Identifier' &&
    node.expression.object.name === GLOBAL_VARIABLE
}

function optimizeCurlyTag (value, variables, newVariables) {
  value = addPlaceholders(value)
  if (isObject(value)) value = `(${value})`
  const tree = new AbstractSyntaxTree(value)
  if (isGlobalVariable(tree)) { return curlyTag(value) }
  tree.replace({ enter: removePlaceholders })
  tree.replace({ enter: (node, parent) => inlineVariables(node, parent, variables, newVariables) })
  tree.replace({ enter: memberExpressionReduction })
  tree.replace({ enter: logicalExpressionReduction })
  tree.replace({ enter: binaryExpressionReduction })
  tree.replace({ enter: ternaryOperatorReduction })
  tree.replace({ enter: ifStatementRemoval })
  tree.replace({ enter: falsyCodeRemoval })
  tree.replace({ enter: undefinedOptionsRemoval })
  if (canInlineTree(tree)) {
    const { value } = tree.body[0].expression
    return value
  } else if (!tree.source) {
    return ''
  }
  return curlyTag(tree.source.replace(/;\n$/, ''))
}

function isNodeAddingNewVariables (node) {
  return isForTag(node) || isForeachTag(node) || isEachTag(node)
}

function isForTag (node) {
  return node.tagName === 'for'
}

function isForeachTag (node) {
  return node.tagName === 'foreach'
}

function isEachTag (node) {
  return node.tagName === 'each'
}

const FORBIDDEN_TAGS = ['template', 'script', 'style']
function curlyTagReduction (string, variables) {
  const tree = parse(string)
  const newVariables = []
  walk(tree, node => {
    if (node.forbidden) return
    if (node.tagName === 'var') {
      variables.push(node.attributes[0])
    }
    if (isNodeAddingNewVariables(node)) {
      if (node.attributes.length === 3) {
        const attribute = node.attributes[0]
        newVariables.push({ key: attribute.key, value: attribute.value })
      } else if (node.attributes.length === 5) {
        const attribute1 = node.attributes[0]
        const attribute2 = node.attributes[2]
        newVariables.push({ key: attribute1.key, value: attribute1.value })
        newVariables.push({ key: attribute2.key, value: attribute2.value })
      }
    }
    const { attributes } = node
    if (FORBIDDEN_TAGS.includes(node.tagName)) {
      node.children.forEach(node => {
        node.forbidden = true
      })
    }
    const vars = [
      ...variables,
      ...newVariables.map((variable) => {
        variable.local = true
        return variable
      })
    ]
    inlineLocalVariablesInTags(node, vars, true)
    if (node.type === 'text') {
      node.content = optimizeText(node.content, variables, newVariables)
    } else if (attributes && attributes.length > 0) {
      attributes.forEach(attribute => {
        attribute.value = optimizeText(attribute.value, variables, newVariables)
      })
      node.attributes = attributes.filter(attribute => attribute.value !== '')
    }
  })
  return stringify(tree, string)
}

function optimizeText (text, variables, newVariables) {
  if (!text) return text
  let tokens = lexer(text)
  tokens = tokens.map(token => {
    if (token.type === 'expression') {
      token.value = optimizeCurlyTag(token.value, variables, newVariables)
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
