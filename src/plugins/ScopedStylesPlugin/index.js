'use strict'

const Plugin = require('../Plugin')
const { addScopeToCssSelectors } = require('./css')
const { addScopeToHtmlClassAttribute, addClassAttributeWithScopeToHtmlTag } = require('./html')

class ScopedStylesPlugin extends Plugin {
  constructor () {
    super()
    this.scopes = {}
  }

  beforeprerun () {
    this.scopes[this.depth] = []
  }

  prerun ({ tag, keys, children, attributes }) {
    if (tag === 'style' && keys.includes('scoped')) {
      children.forEach(node => addScopeToCssSelectors(node, this.scopes[this.depth], attributes))
    }
  }

  run ({ tag, keys, attributes }) {
    if (this.scopes[this.depth].length > 0) {
      if (keys && keys.includes('class')) {
        addScopeToHtmlClassAttribute(tag, attributes, this.scopes[this.depth])
      } else {
        addClassAttributeWithScopeToHtmlTag(tag, attributes, this.scopes[this.depth])
      }
    }
  }
}

module.exports = ScopedStylesPlugin
