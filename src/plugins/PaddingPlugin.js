const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const { isNumeric } = require('pure-conditions')
const AbstractSyntaxTree = require('abstract-syntax-tree')

class PaddingPlugin {
  convertValue (value) {
    value = value.replace(/\s+/g, '')
    if (isCurlyTag(value)) {
      value = getExpressionFromCurlyTag(value)
      const { expression } = new AbstractSyntaxTree(value).body[0]
      return expression.value
    }
    return value
  }

  prepare ({ keys, fragment, attrs }) {
    const attribute = attrs.find(attr => attr.key === 'padding')
    if (attribute) {
      let { key, value } = attribute
      value = this.convertValue(value)
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
  run () {}
}

module.exports = PaddingPlugin
