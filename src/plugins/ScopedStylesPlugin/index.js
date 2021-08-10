'use strict'

const Plugin = require('../Plugin')
const { addScopeToCssSelectors } = require('./css')
const { addScopeToHtmlClassAttribute, addClassAttributeWithScopeToHtmlTag } = require('./html')
const { transpile: transpileCss, getSelectors } = require('../../transpilers/css')

class ScopedStylesPlugin extends Plugin {
  constructor () {
    super()
    this.scopes = []
  }

  beforeprerun () {
    this.scopes[this.depth] = []
  }

  prerun ({ fragment, tag, keys, assets, children, attributes }) {
    if (tag === 'import') {
      const from = attributes.find(attribute => attribute.key === 'from')
      if (from && from.value.endsWith('.css')) {
        fragment.tagName = 'var'
        const { key } = attributes[0]
        /* do we need a better check here? */
        const asset = assets.find(asset => asset.name === key)
        fragment.attributes = [{ key, value: getSelectors(transpileCss(asset.source)) }]
      }
    }
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
