'use strict'

const Plugin = require('../Plugin')
const { findAttributeByKey, removeAttributeByKey } = require('../../utilities/attributes')

class TextPlugin extends Plugin {
  prerun ({ fragment, attrs }) {
    const attr = findAttributeByKey(attrs, 'text')
    if (attr) {
      const { value } = attr
      fragment.children.push({ type: 'text', content: value })
      removeAttributeByKey(attrs, 'text')
    }
  }
}

module.exports = TextPlugin
