const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const { isNumeric } = require('pure-conditions')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const serialize = require('asttv')

class PaddingPlugin {
  convertValue (value) {
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

  stringify (object) {
    let result = ``
    let space = ' '
    for (let prop in object) {
      result += `${prop}: ${object[prop]}${space}`
    }
    result = result.trim()
    return result
  }

  prepare ({ keys, fragment, attrs }) {
    const attribute = attrs.find(attr => attr.key === 'padding')
    if (attribute) {
      let { key, value } = attribute
      value = this.convertValue(attribute.value)
      if (typeof value === 'object') {
        const padding = {}
        let suffix = ''
        for (let key in value) {
          suffix = (isNumeric(value[key]) && Number(value[key]) !== 0) ? 'px' : ''
          padding[`${attribute.key}-${key}`] = `${value[key]}${suffix};`
        }
        fragment.attributes.splice(attrs.findIndex(attr => attr.key === 'padding'), 1)
        const result = this.stringify(padding)
        fragment.attributes.push({ key: 'style', value: result })
      } else {
        const suffix = (isNumeric(value) && Number(value) !== 0) ? 'px' : ''
        fragment.attributes.splice(attrs.findIndex(attr => attr.key === 'padding'), 1)
        if (attrs.find(attr => attr.key === 'style')) {
          const styleIndex = fragment.attributes.findIndex(attr => attr.key === 'style')
          fragment.attributes[styleIndex].value += ` ${key}: ${value}${suffix};`
        } else {
          fragment.attributes.push({ key: 'style', value: `${key}: ${value}${suffix};` })
        }
      }
    }
  }
  run () {}
}

module.exports = PaddingPlugin
