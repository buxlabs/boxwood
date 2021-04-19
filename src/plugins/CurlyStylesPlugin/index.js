'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const Plugin = require('../Plugin')
const { isCurlyTag, getTagValue } = require('../../utilities/string')
const { convertObjectToStyleString } = require('../../utilities/style')

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
            attr.value = convertObjectToStyleString(object)
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
