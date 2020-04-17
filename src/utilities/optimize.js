'use strict'

const lexer = require('./lexer')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const {
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  memberExpressionReduction,
  ifStatementRemoval
} = require('astoptech')
const { isCurlyTag, getTagValue, curlyTag } = require('./string')
const { parse, stringify } = require('./html')
const { inlineLocalVariablesInTags } = require('./inline')
const walk = require('himalaya-walk')
const { addPlaceholders, removePlaceholders } = require('./keywords')
const { parseData, getDataFormat } = require('./data')
const { isGlobalVariable } = require('./globals')
const { isPlainObject } = require('pure-conditions')

function canInlineTree ({ body }) {
  const statement = body[0]
  return body.length === 1 &&
    isExpressionStatement(statement) &&
    isLiteral(statement.expression) &&
    typeof statement.expression.value === 'string'
}

function inlineVariables (node, parent, variables, newVariables, loose) {
  if (node.inlined) return node
  if (parent.type === 'MemberExpression' && node === parent.property) return node
  if (parent.type === 'Property') return node
  // TODO foo.bar.baz should be optimized
  // right now it will just inject objects into the root key
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
        if (!loose) { node.name = 'undefined' }
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

function isMemberExpression (node) {
  return node.type === 'ExpressionStatement' && node.expression.type === 'MemberExpression'
}

function isUndefinedMemberExpression (node) {
  return node.type === 'ExpressionStatement' &&
    node.expression.type === 'MemberExpression' &&
    node.expression.object.type === 'Identifier' &&
    node.expression.object.name === 'undefined'
}

function isComplexUndefinedMemberExpression (node) {
  if (!isMemberExpression(node)) { return false }
  node = node.expression
  while (node.object.type === 'MemberExpression') {
    node = node.object
  }
  return isUndefinedMemberExpression(node)
}

function undefinedOptionsRemoval (node) {
  if (isUndefinedMemberExpression(node) || isComplexUndefinedMemberExpression(node)) {
    return null
  }
  return node
}

function optimizeCurlyTag (value, variables, newVariables, loose) {
  if (loose) { return looseOptimizeCurlyTag(value, variables) }
  value = addPlaceholders(value)
  if (isObject(value)) value = `(${value})`
  const tree = new AbstractSyntaxTree(value)
  if (isGlobalVariable(tree.body[0])) {
    return curlyTag(value)
  }
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

function looseOptimizeCurlyTag (value, variables) {
  value = addPlaceholders(value)
  if (isObject(value)) value = `(${value})`
  const tree = new AbstractSyntaxTree(value)
  if (isGlobalVariable(tree)) { return curlyTag(value) }
  tree.replace({ enter: (node, parent) => inlineVariables(node, parent, variables, [], true) })
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
    } else if (node.tagName === 'data') {
      const keys = node.attributes.map(attribute => attribute.key)
      const format = getDataFormat(keys)
      const { content } = node.children[0]
      const data = parseData(format, content)
      if (isPlainObject(data)) {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key]
            variables.push({ key, value })
          }
        }
      }
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
    optimizeNode(node, variables, newVariables)
  })
  return stringify(tree, string)
}

function optimizeNode (node, variables, newVariables = [], loose) {
  const { attributes } = node
  if (node.type === 'text') {
    node.content = optimizeText(node.content, variables, newVariables, loose)
  } else if (attributes && attributes.length > 0) {
    attributes.forEach(attribute => {
      attribute.value = optimizeText(attribute.value, variables, newVariables, loose)
    })
    node.attributes = attributes.filter(attribute => attribute.value !== '')
  }
}

function optimizeText (text, variables, newVariables, loose) {
  if (!text) return text
  let tokens = lexer(text)
  tokens = tokens.map(token => {
    if (token.type === 'expression') {
      token.value = optimizeCurlyTag(token.value, variables, newVariables, loose)
    }
    return token
  })
  const value = tokens.map(token => token.value).join('')
  return value.trim()
}

function optimize (source, variables) {
  return curlyTagReduction(source, variables)
}

module.exports = { optimize, optimizeNode }
