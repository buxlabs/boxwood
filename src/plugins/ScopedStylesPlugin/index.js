'use strict'

const Plugin = require('../Plugin')
const { addScopeToCssSelectors } = require('./css')
const { addScopeToHtmlClassAttribute, addClassAttributeWithScopeToHtmlTag } = require('./html')

class ScopedStylesPlugin extends Plugin {
  constructor () {
    super()
    this.scopes = []
  }

  beforeprerun () {
    this.scopes[this.depth] = []
  }

  prerun ({ tag, keys, children, attributes }) {
    if (tag === 'style' && keys.includes('scoped')) {
      children.forEach(node => {
        node.content = addScopeToCssSelectors(node.content, this.scopes[this.depth])
      })
    }
  }

  run ({ tag, keys, attributes, fragment }) {
    if (this.scopes[this.depth].length > 0) {
      if (fragment.imported && this.depth === 0) { return }
      if (keys && keys.includes('class')) {
        addScopeToHtmlClassAttribute(tag, attributes, this.scopes[this.depth])
      } else {
        addClassAttributeWithScopeToHtmlTag(tag, attributes, this.scopes[this.depth])
      }
    }
  }
}

module.exports = ScopedStylesPlugin
