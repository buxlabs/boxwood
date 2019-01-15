const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const serialize = require('asttv')
const AbstractSyntaxTree = require('abstract-syntax-tree')

function hyphenate (string) {
  return string.replace(/([A-Z])/g, character => {
    return '-' + character.toLowerCase()
  })
}

function stringify (object) {
  const array = Object.keys(object).map(attribute => {
    return hyphenate(attribute) + ':' + object[attribute] + ';'
  })
  return array.join('')
}

class CurlyStylesPlugin {
  constructor () {
    this.scopes = []
  }
  prepare ({ keys, fragment, attrs }) {
    if (keys.includes('style')) {
      const attr = attrs.find(attr => attr.key === 'style')
      if (isCurlyTag(attr.value)) {
        try {
          const expression = getExpressionFromCurlyTag(attr.value)
          const tree = new AbstractSyntaxTree(`(${expression})`)
          const object = serialize(tree.first('ObjectExpression'))
          attr.value = stringify(object)
        } catch (exception) {
          // TODO implement
        }
      }
    }
  }
  run () {}
}

module.exports = CurlyStylesPlugin
