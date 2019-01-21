const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const serialize = require('asttv')
const { isNumeric } = require('pure-conditions')
const AbstractSyntaxTree = require('abstract-syntax-tree')

class PaddingPlugin {
  getValue (attribute) {
    let value = attribute.value.replace(/\s+/g, '')
    if (isCurlyTag(value)) {
      value = getExpressionFromCurlyTag(value)
      const { expression } = new AbstractSyntaxTree(value).body[0]
      return expression.value
    }
    return value
  }

  prepare ({ keys, fragment, attrs }) {
    const padding = attrs.find(attr => attr.key === 'padding')
    const style = attrs.find(attr => attr.key === 'style')
    const index = attrs.findIndex(attr => attr.key === 'padding')
    if (style) {

    } else if (padding) {
      let value = this.getValue(padding)
      fragment.attributes.splice(index, 1)
      const suffix = (isNumeric(value) && Number(value) !== 0) ? 'px' : ''
      fragment.attributes.push({ key: 'style', value: `${padding.key}: ${value}${suffix};` })
    }
  }
  run () {}
}

module.exports = PaddingPlugin
