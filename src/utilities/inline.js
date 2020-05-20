'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { binaryExpressionReduction, logicalExpressionReduction } = require('astoptech')
const { isCurlyTag, isSquareTag, getTagValue } = require('./string')
const { addPlaceholders, removePlaceholders, placeholderName } = require('./keywords')
const { convertToExpression, convertText } = require('./convert')
const { normalize } = require('./array')
const { GLOBAL_VARIABLE } = require('./enum')

function inlineLocalVariablesInText (node, variables) {
  if (node.type === 'text') {
    variables.forEach(variable => {
      if (!isCurlyTag(variable.value)) {
        node.content = node.content.replace(new RegExp(`{${variable.key}}`, 'g'), variable.value)
      }
    })
  }
}

function getOptimizedCurlyTagSource (tree, isInCondition) {
  let { expression } = tree.body[0]
  if (isInCondition) {
    return `{${tree.source.replace(/;\n$/, '')}}`
  }
  if (expression.type === 'BinaryExpression') {
    expression = binaryExpressionReduction(expression)
  } else if (expression.type === 'LogicalExpression') {
    expression = logicalExpressionReduction(expression)
  }
  if (expression.type === 'Literal') {
    if (typeof expression.value === 'number') {
      return expression.value.toString()
    } else if (typeof expression.value === 'boolean') {
      return `{${expression.value}}`
    }
    return expression.value
  }
  return `{${tree.source.replace(/;\n$/, '')}}`
}

function getOptimizedSquareTagSource (tree) {
  const { expression } = tree.body[0]
  expression.elements = expression.elements
    .map(element => {
      if (element.type === 'LogicalExpression') {
        return logicalExpressionReduction(element)
      }
      return element
    })
    .filter(element => {
      if (element.type === 'Identifier' && element.name === 'undefined') {
        return false
      } else if (element.type === 'Literal' && element.value === false) {
        return false
      } else if (element.type === 'LogicalExpression' && element.operator === '&&' && element.left.type === 'Identifier' && element.left.name === 'undefined') {
        return false
      }
      return true
    })

  if (expression.elements.every(element => element.type === 'Literal' && typeof element.value === 'string')) {
    const array = AbstractSyntaxTree.serialize(expression)
    return array.map(string => string.trim()).join(' ')
  }
  return tree.source.replace(/;\n$/, '')
}

// TODO add more unit tests
function inlineLocalVariablesInAttributes (node, localVariables, variables) {
  if (node.attributes && node.attributes.length > 0) {
    node.attributes.forEach(attribute => {
      if (CONDITION_TAGS.includes(node.tagName)) { inlineIn(attribute, 'key', localVariables, variables, true) }
      inlineIn(attribute, 'value', localVariables, variables, false)
    })
  }
}

function inlineIn (attribute, property, localVariables, variables, isInCondition) {
  // should use containsCurlyTag and extract too
  if (isCurlyTag(attribute[property])) {
    const input = getTagValue(attribute[property])
    if (isCurlyTag(input) || (input.startsWith('({') && input.endsWith('})'))) {
      return
    }
    const source = addPlaceholders(input)
    const tree = new AbstractSyntaxTree(source)
    tree.replace({
      enter: (node, parent) => {
        // TODO investigate
        // this is too optimistic
        if (node.type === 'Identifier' && (!parent || parent.type !== 'MemberExpression')) {
          const variable = localVariables.find(variable => variable.key === node.name || placeholderName(variable.key) === node.name)
          if (variable) {
            if (isCurlyTag(variable.value)) {
              return convertToExpression(getTagValue(variable.value))
            }
            return { type: 'Literal', value: variable.value }
          }
        }
        return node
      }
    })
    tree.replace(removePlaceholders)
    attribute[property] = getOptimizedCurlyTagSource(tree, isInCondition)
  } else if (isSquareTag(attribute[property])) {
    const source = addPlaceholders(attribute[property])
    const tree = new AbstractSyntaxTree(source)
    tree.replace((node, parent) => {
      if (node.type === 'Identifier' && (!parent || parent.type !== 'MemberExpression')) {
        const variable = localVariables.find(localVariable => localVariable.key === node.name || placeholderName(localVariable.key) === node.name)
        if (variable) {
          if (isCurlyTag(variable.value)) {
            // TODO handle this case correctly in convertText
            if (variable.value === '{false}') {
              return { type: 'Literal', value: false }
            } else if (variable.value === '{true}') {
              return { type: 'Literal', value: true }
            }
            return convertText(variable.value, variables, [], [], [], true)[0]
          }
          return { type: 'Literal', value: variable.value }
        } else if (!variables.includes(node.name) && !variables.map(placeholderName).includes(node.name)) {
          return { type: 'Identifier', name: 'undefined' }
        }
      }
      return node
    })
    tree.replace(removePlaceholders)
    attribute[property] = getOptimizedSquareTagSource(tree, isInCondition)
  }
}

const CONDITION_TAGS = ['if', 'elseif', 'unless', 'elseunless']
const LOOP_TAGS = ['for', 'each', 'foreach']
function inlineLocalVariablesInTags (node, localVariables, warnings, remove) {
  // TODO we should handle switch etc.
  if (CONDITION_TAGS.includes(node.tagName)) {
    const normalizedAttributes = normalize(node.attributes, warnings)
    node.attributes = normalizedAttributes.map(attr => {
      // TODO handle or remove words to numbers functionality
      if (attr.type === 'Identifier' && !isCurlyTag(attr.key)) {
        // TODO this does not handle computed values
        // we should create a new abstract-syntax-tree and get the key that way
        // instead of string manipulation
        const key = attr.key.includes('.') ? attr.key.split('.')[0] : attr.key
        if (key === GLOBAL_VARIABLE) { return attr }
        const variable = localVariables && localVariables.find(variable => variable.key === key)
        if (variable && variable.local) {
          return attr
        } else if (variable && isCurlyTag(variable.value)) {
          attr.key = `${variable.value}`
        } else if (!variable && remove) {
          attr.key = '{void(0)}'
        } else {
          attr.key = `{${attr.key}}`
        }
      }
      return attr
    })
  } else if (LOOP_TAGS.includes(node.tagName)) {
    if (node.attributes.length === 3 || node.attributes.length === 5) {
      const attribute = node.attributes[node.attributes.length - 1]
      const variable = localVariables && localVariables.find(variable => variable.key === attribute.key)
      if (variable) {
        const value = getTagValue(variable.value).trim()
        const previous = node.attributes[node.attributes.length - 2]
        if (isCurlyTag(value)) {
          previous.value = `{${value}}`
          node.attributes.pop()
        } else if (isSquareTag(value)) {
          previous.value = `{${value}}`
          node.attributes.pop()
        } else if (value.startsWith('(') && value.endsWith(')')) {
          const string = getTagValue(value).trim()
          if (isCurlyTag(string)) {
            previous.value = `{${string}}`
            node.attributes.pop()
          }
        }
      }
    }
  }
}

function inlineLocalVariables (node, localVariables, variables, warnings) {
  inlineLocalVariablesInText(node, localVariables)
  inlineLocalVariablesInAttributes(node, localVariables, variables)
  inlineLocalVariablesInTags(node, localVariables, warnings)
}

module.exports = {
  inlineLocalVariablesInTags,
  inlineLocalVariablesInAttributes,
  inlineLocalVariables
}
