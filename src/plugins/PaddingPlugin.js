const serialize = require('asttv')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { isNumeric } = require('pure-conditions')

class PaddingPlugin {
  prepare ({ keys, fragment, attrs }) {
    const padding = attrs.find(attr => attr.key === 'padding')
    const style = attrs.find(attr => attr.key === 'style')
    const index = attrs.findIndex(attr => attr.key === 'padding')

    if (style) {
    } else if (padding) {
      fragment.attributes.splice(index, 1)
      if (padding.value !== '0' && isNumeric(padding.value)) {
        fragment.attributes.push({ key: 'style', value: `${padding.key}: ${padding.value}px;` })
      } else {
        fragment.attributes.push({ key: 'style', value: `${padding.key}: ${padding.value};` })
      }
    } else {

    }
  }
  run () {}
}

module.exports = PaddingPlugin
