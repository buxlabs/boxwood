'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { identifier } = require('pure-utilities/array')
const { convertAttribute } = require('../utilities/convert')
const { curlyTag, getTagValue, isSquareTag } = require('../utilities/string')
const { getForLoop, getForLoopVariable, getForInLoop, getForInLoopVariable } = require('../utilities/factory')
const THREE_DOTS = '...'
const TWO_DOTS = '..'

function getRange (attribute) {
  let range
  if (attribute && attribute.key === 'range' && attribute.value) {
    if (attribute.value.includes(THREE_DOTS)) {
      range = attribute.value.split(THREE_DOTS).map(Number)
    } else if (attribute.value.includes(TWO_DOTS)) {
      range = attribute.value.split(TWO_DOTS).map(Number)
      range[1] += 1
    } else if (isSquareTag(attribute.value)) {
      const tree = new AbstractSyntaxTree(attribute.value)
      range = tree.first('ArrayExpression').elements
    } else {
      range = [0, Number(attribute.value) + 1]
    }
  }
  return range
}

module.exports = function ({ fragment, tree, attrs, variables, translations, languages, collectChildren }) {
  if (attrs.length <= 3) {
    const ast = new AbstractSyntaxTree('')
    const [left, operator, right] = attrs
    const range = getRange(right)
    const variable = left.key
    const parent = operator.value || curlyTag(right.key)
    const name = convertAttribute('html', parent, variables, translations, languages)
    const expression = getTagValue(parent) // TODO: Handle nested properties
    variables.push(variable)
    const index = identifier(variables.concat(expression))
    variables.push(index)
    const guard = identifier(variables.concat(expression))
    variables.push(guard)
    ast.append(getForLoopVariable(variable, name, variables, index, range))
    collectChildren(fragment, ast)
    ast.walk(node => {
      if (node.type === 'Identifier' && node.name === variable) {
        node.inlined = true
      }
    })
    tree.append(getForLoop(name, ast.body, variables, index, guard, range))
    variables.pop()
    variables.pop()
    variables.pop()
  } else if (attrs.length <= 5) {
    const ast = new AbstractSyntaxTree('')
    const [key, , value, operator, right] = attrs
    if (operator.key === 'in' || operator.key === '|') {
      const keyIdentifier = key.key
      const valueIdentifier = value.key
      variables.push(keyIdentifier)
      variables.push(valueIdentifier)

      const parent = operator.value || curlyTag(right.key)
      const name = convertAttribute('html', parent, variables, translations, languages)
      ast.append(getForInLoopVariable(keyIdentifier, valueIdentifier, name))

      collectChildren(fragment, ast)
      tree.append(getForInLoop(keyIdentifier, name, ast.body))
      variables.pop()
      variables.pop()
    } else if (operator.key === 'of') {
      const keyIdentifier = key.key
      const valueIdentifier = value.key
      variables.push(keyIdentifier)
      variables.push(valueIdentifier)
      const parent = operator.value || curlyTag(right.key)
      const name = convertAttribute('html', parent, variables, translations, languages)
      ast.append(getForLoopVariable(keyIdentifier, name, variables, valueIdentifier))

      collectChildren(fragment, ast)

      const guard = identifier(variables)
      variables.push(guard)
      tree.append(getForLoop(name, ast.body, variables, valueIdentifier, guard))
      variables.pop()
      variables.pop()
      variables.pop()
    }
  }
}
