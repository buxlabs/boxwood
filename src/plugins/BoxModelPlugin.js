const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const serialize = require('asttv')
const { isNumeric } = require('pure-conditions')
const AbstractSyntaxTree = require('abstract-syntax-tree')

function findAttributeByKey (attributes, attribute) {
  if (attributes) return attributes.find(attr => attr.key === attribute)
}

function convert (value) {
  if (isCurlyTag(value)) {
    value = value.replace(/\s+/g, '')
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

function getStyles (key, value) {
  let styles = ''
  if (typeof value === 'object') {
    for (let property in value) {
      const suffix = getSuffix(value[property])
      styles += `${key}-${property}: ${value[property]}${suffix} `
    }
    styles = styles.trim()
  } else {
    const suffix = getSuffix(value)
    styles = `${key}: ${value}${suffix}`
  }
  return styles
}

function getSuffix (value) {
  return (isNumeric(value) && Number(value) !== 0) ? 'px;' : ';'
}

function appendStyles (attributes, value) {
  const attribute = findAttributeByKey(attributes, 'style')
  if (attribute) {
    attribute.value += ` ${value}`
  } else {
    attributes.push({ key: 'style', value })
  }
}

function removeAttribute (attributes, attribute) {
  attributes.splice(attributes.findIndex(attr => attr.key === attribute), 1)
}

class BoxModelPlugin {
  prepare ({ keys, fragment }) {
    function transform (key) {
      const attribute = findAttributeByKey(fragment.attributes, key)
      if (attribute) {
        attribute.value = convert(attribute.value)
        const inlineStyles = getStyles(attribute.key, attribute.value)
        appendStyles(fragment.attributes, inlineStyles)
        removeAttribute(fragment.attributes, key)
      }
    }
    transform('padding')
    transform('margin')
  }

  run () {}
}

module.exports = BoxModelPlugin
