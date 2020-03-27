'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { wordsToNumbers } = require('words-to-numbers')
const { getAction } = require('./action')
const { normalize } = require('./array')
const { getLiteral, getIdentifier } = require('./ast')
const { convertKey, convertToExpression } = require('./convert')
const { isCurlyTag, getTagValue } = require('./string')
const { OBJECT_VARIABLE, OPERATORS } = require('./enum')

function getLiteralOrIdentifier (attribute, variables) {
  const key = attribute.key || attribute
  const value = wordsToNumbers(key)
  return typeof value === 'number' ? getLiteral(value) : convertKey(key, variables)
}

function convertValueToNode (value, variables) {
  if (isCurlyTag(value)) {
    value = getTagValue(value)
    const expression = convertToExpression(value)
    if (expression.type === 'Identifier') {
      return convertKey(value, variables)
    } else if (expression.type === 'Literal') {
      return getLiteral(expression.value)
    } else if (expression.type === 'BinaryExpression') {
      AbstractSyntaxTree.replace(expression, {
        enter: (node, parent) => {
          if (node.type === 'MemberExpression') {
            if (node.object.type === 'Identifier' && !node.object.transformed) {
              node.object.transformed = true
              const object = getIdentifier(OBJECT_VARIABLE)
              object.transformed = true
              node.object = {
                type: 'MemberExpression',
                object,
                property: node.object
              }
            }
          }
          return node
        }
      })
      return expression
    }
  }
  return getLiteral(value)
}

function getLeftNodeFromAttribute (last, variables) {
  if (!last) return null
  return getLiteralOrIdentifier(last, variables)
}

function getRightNodeFromAttribute (current, next, variables) {
  if (current.value) return convertValueToNode(current.value, variables)
  return getLiteralOrIdentifier(next, variables)
}

function findActions (attributes) {
  return attributes
    .filter(attr => attr.type === 'Action')
    .map((attr, index, array) => {
      if (attr.key === 'is_between') array.splice([index + 1], 1)
      return getAction(attr.key)
    }).filter(Boolean)
}

function getTest (action, keys, values, variables) {
  if (action.args === 1) {
    const key = keys[0] === 'not' ? keys[1] : keys[0]
    const node = getLiteralOrIdentifier(key, variables)
    return action.handler(node)
  } else if (action.args === 2) {
    const left = getLiteralOrIdentifier(keys[0], variables)
    const right = values[1] ? convertValueToNode(values[1], variables) : getLiteralOrIdentifier(keys[2], variables)
    return action.handler(left, right)
  } else if (action.args === 3) {
    const node = getLiteralOrIdentifier(keys[0], variables)
    const startRange = getLiteralOrIdentifier(keys[2], variables)
    const endRange = getLiteralOrIdentifier(keys[4], variables)
    return action.handler(node, startRange, endRange)
  }
}

function getCondition (attrs, variables, filters, translations, languages, warnings) {
  const attributes = normalize(attrs, warnings)
  const keys = attributes.map(attr => attr.key)
  const values = attributes.map(attr => attr.value)
  const actions = findActions(attributes)
  if (actions.length === 0) {
    const key = keys[0]
    return convertKey(key, variables, filters, translations, languages)
  } else if (actions.length === 1) {
    return getTest(actions[0], keys, values, variables)
  } else {
    const expressions = []
    for (let i = 0, ilen = attributes.length; i < ilen; i += 1) {
      const attribute = attributes[i]
      if (attribute.type === 'Identifier') {
        const last = attributes[i - 1]
        const next = attributes[i + 1]
        if (!next || OPERATORS.includes(next.key)) {
          let node = getLeftNodeFromAttribute(attribute, variables)
          if (last && last.key === 'not') {
            node = { type: 'UnaryExpression', operator: '!', prefix: true, argument: node }
          }
          expressions.push(node)
        }
      } else if (attribute.type === 'Action') {
        const action = actions.find(action => action.name === attribute.key)
        if (OPERATORS.includes(attribute.key)) {
          expressions.push(action)
        } else {
          if (action.args === 1) {
            if (action.name === 'not') {
              const next = attributes[i + 1]
              i += 1
              const left = getLeftNodeFromAttribute(next, variables)
              expressions.push(action.handler(left))
            } else {
              const previous = attributes[i - 1]
              const left = getLeftNodeFromAttribute(previous, variables)
              expressions.push(action.handler(left))
            }
          } else if (action.args === 2) {
            const previous = attributes[i - 1]
            const current = attributes[i]
            const next = attributes[i + 1]
            i += 1
            const left = getLeftNodeFromAttribute(previous, variables)
            const right = getRightNodeFromAttribute(current, next, variables)
            expressions.push(action.handler(left, right))
          } else if (action.args === 3) {
            const node = getLiteralOrIdentifier(attributes[i - 1], variables)
            const startRange = getLiteralOrIdentifier(attributes[i + 1], variables)
            const endRange = getLiteralOrIdentifier(attributes[i + 3], variables)
            expressions.push(action.handler(node, startRange, endRange))
          }
        }
      }
    }
    const stack = []
    const conditions = []
    for (let i = 0, ilen = expressions.length; i < ilen; i += 1) {
      const expression = expressions[i]
      if (OPERATORS.includes(expression.name)) {
        const left = stack.shift() || expressions[i - 1]
        const right = expressions[i + 1]
        i += 1
        const condition = expression.handler(left, right)
        stack.push(condition)
        conditions.push(condition)
      }
    }
    return conditions[conditions.length - 1]
  }
}

module.exports = { getCondition }
