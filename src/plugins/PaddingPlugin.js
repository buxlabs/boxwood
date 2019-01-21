const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const serialize = require('asttv')
const { isNumeric } = require('pure-conditions')
const AbstractSyntaxTree = require('abstract-syntax-tree')

function getAttribute (attributes, attribute) {
  if (attributes) return attributes.find(attr => attr.key === attribute)
}

function convert (value) {
  value = value.replace(/\s+/g, '')
  if (isCurlyTag(value)) {
    value = getExpressionFromCurlyTag(value)
    const { expression } = new AbstractSyntaxTree(`(${value})`).body[0]
    if (expression.type === 'ObjectExpression') {
      const object = serialize(expression)
      return object
    }
    return expression.value
  }
  return value
}

function getInlineStyles (key, value) {
  let inlineStyles = ``
  if (typeof value === 'object') {
    for (let property in value) {
      const suffix = getSuffix(value[property])
      inlineStyles += `${key}-${property}: ${value[property]}${suffix} `
    }
    inlineStyles = inlineStyles.trim()
  } else {
    const suffix = getSuffix(value)
    inlineStyles = `${key}: ${value}${suffix}`
  }
  return inlineStyles
}

function getSuffix (value) {
  return (isNumeric(value) && Number(value) !== 0) ? 'px;' : ';'
}

function generatePadding (attributes, value) {
  const index = attributes.findIndex(attr => attr.key === 'style')
  index !== -1 ? attributes[index].value += ` ${value}` : attributes.push({ key: 'style', value })
}

function removeAttribute (attributes, attribute) {
  attributes.splice(attributes.findIndex(attr => attr.key === attribute), 1)
}

class PaddingPlugin {
  prepare ({ keys, fragment }) {
    const attribute = getAttribute(fragment.attributes, 'padding')
    if (attribute) {
      attribute.value = convert(attribute.value)
      const inlineStyles = getInlineStyles(attribute.key, attribute.value)
      generatePadding(fragment.attributes, inlineStyles)
      removeAttribute(fragment.attributes, 'padding')
    }
  }

  run () {}
}

module.exports = PaddingPlugin
