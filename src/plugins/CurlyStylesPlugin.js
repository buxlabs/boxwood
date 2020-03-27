'use strict'

const { isCurlyTag, getTagValue } = require('../utilities/string')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { flatten } = require('pure-utilities/collection')
const Plugin = require('./Plugin')

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

class CurlyStylesPlugin extends Plugin {
  constructor () {
    super()
    this.scopes = []
  }

  prerun ({ keys, fragment, attrs }) {
    function inline (name) {
      if (keys.includes(name)) {
        const attr = attrs.find(attr => attr.key === name)
        if (isCurlyTag(attr.value)) {
          try {
            const expression = getTagValue(attr.value)
            const tree = new AbstractSyntaxTree(`(${expression})`)
            const object = AbstractSyntaxTree.serialize(tree.first('ObjectExpression'))
            attr.key = 'style'
            attr.value = stringify(object)
          } catch (exception) {
            // TODO implement
          }
        } else {
          attr.key = 'style'
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
