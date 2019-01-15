const { isCurlyTag, getExpressionFromCurlyTag } = require('../string')
const serialize = require('asttv')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { flatten } = require('pure-utilities/object')

function dasherize (string) {
  return string.replace(/\./g, '-')
}

function hyphenate (string) {
  return string.replace(/([A-Z])/g, character => {
    return '-' + character.toLowerCase()
  })
}

function stringify (object) {
  object = flatten(object)
  const array = Object.keys(object).map(attribute => {
    return hyphenate(dasherize(attribute)) + ':' + object[attribute] + ';'
  })
  return array.join('')
}

class CurlyStylesPlugin {
  constructor () {
    this.scopes = []
  }
  prepare ({ keys, fragment, attrs }) {
    function inline (name) {
      if (keys.includes(name)) {
        const attr = attrs.find(attr => attr.key === name)
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

    inline('style')
    inline('css')
  }
  run () {

  }
}

module.exports = CurlyStylesPlugin
