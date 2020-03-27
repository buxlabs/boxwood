'use strict'

const { isCurlyTag, getTagValue, isImportTag, isPartialTag } = require('../utilities/string')
const { isNumeric } = require('pure-conditions')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const Plugin = require('./Plugin')
const { hyphenate, capitalize } = require('pure-utilities/string')

const ATTRIBUTES = ['padding', 'margin', 'border']
const DIRECTIONS = ['top', 'right', 'bottom', 'left']
const BOX_MODEL_ATTRIBUTES = Array.from(ATTRIBUTES)
for (const attribute of ATTRIBUTES) {
  for (const direction of DIRECTIONS) {
    const boxModelAttribute = attribute.concat(capitalize(direction))
    BOX_MODEL_ATTRIBUTES.push(boxModelAttribute, hyphenate(boxModelAttribute))
  }
}

function findAttributeByKey (attributes, attribute) {
  if (attributes) return attributes.find(attr => attr.key === attribute)
}

function convert (value) {
  if (isCurlyTag(value)) {
    value = value.replace(/\s+/g, '')
    value = getTagValue(value)
    const { expression } = new AbstractSyntaxTree(`(${value})`).body[0]
    if (expression.type === 'ObjectExpression') {
      const object = AbstractSyntaxTree.serialize(expression)
      return object
    }
    return expression.value
  }
  return value
}

function getStyles (attributeKey, key, value, variables = {}) {
  if (value in variables) {
    value = variables[value]
  }
  if (attributeKey === 'border') {
    return `border: ${value};`
  }
  let styles = ''
  if (typeof value === 'object') {
    for (const property in value) {
      if (variables[value[property]]) {
        value[property] = variables[value[property]]
      }
      const suffix = getSuffix(value[property])
      styles += `${key}-${property}: ${value[property]}${suffix} `
    }
    styles = styles.trim()
  } else {
    const suffix = getSuffix(value)
    styles = `${hyphenate(key)}: ${value}${suffix}`
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

class BoxModelPlugin extends Plugin {
  constructor (options = {}) {
    super()
    if (options.style) {
      this.variables = options.style.variables
    }
  }

  beforeprerun () {
    this.components = []
  }

  prerun ({ tag, keys, fragment }) {
    const variables = this.variables
    function transform (key) {
      const attribute = findAttributeByKey(fragment.attributes, key)
      if (attribute) {
        attribute.value = convert(attribute.value)
        const inlineStyles = getStyles(key, attribute.key, attribute.value, variables)
        appendStyles(fragment.attributes, inlineStyles)
        removeAttribute(fragment.attributes, key)
      }
    }
    if (isImportTag(tag)) {
      const name = keys[0]
      this.components.push(name)
    }
    if (!this.components.includes(tag) && !isPartialTag(tag)) {
      BOX_MODEL_ATTRIBUTES.forEach(transform)
    }
  }

  afterprerun () {
    this.components = []
  }

  run () {}
}

module.exports = BoxModelPlugin
