const AbstractSyntaxTree = require('abstract-syntax-tree')
const { identifier } = require('pure-utilities/array')
const { convertAttribute } = require('../convert')
const { curlyTag, getTagValue } = require('../string')
const { getForLoop, getForLoopVariable, getForInLoop, getForInLoopVariable } = require('../factory')
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
    } else {
      range = [0, Number(attribute.value) + 1]
    }
  }
  return range
}

module.exports = function ({ fragment, tree, attrs, variables, translations, languages, translationsPaths, collectChildren }) {
  if (attrs.length <= 3) {
    const ast = new AbstractSyntaxTree('')
    const [left, operator, right] = attrs
    const range = getRange(right)
    const variable = left.key
    const parent = operator.value || curlyTag(right.key)
    const name = convertAttribute('html', parent, variables, translations, languages, translationsPaths)
    const expression = getTagValue(parent) // TODO: Handle nested properties
    variables.push(variable)
    const index = identifier(variables.concat(expression))
    variables.push(index)
    const guard = identifier(variables.concat(expression))
    variables.push(guard)
    ast.append(getForLoopVariable(variable, name, variables, index, range))
    collectChildren(fragment, ast)
    tree.append(getForLoop(name, ast.body, variables, index, guard, range))
    variables.pop()
    variables.pop()
    variables.pop()
  } else if (attrs.length <= 5) {
    const ast = new AbstractSyntaxTree('')
    const [key, , value, operator, right] = attrs
    const keyIdentifier = key.key
    const valueIdentifier = value.key
    variables.push(keyIdentifier)
    variables.push(valueIdentifier)

    const parent = operator.value || curlyTag(right.key)
    const name = convertAttribute('html', parent, variables, translations, languages, translationsPaths)
    ast.append(getForInLoopVariable(keyIdentifier, valueIdentifier, name))

    collectChildren(fragment, ast)
    tree.append(getForInLoop(keyIdentifier, name, ast.body))
    variables.pop()
    variables.pop()
  }
}
