const Plugin = require('./Plugin')
const { parse, walk, generate } = require('css-tree')
const { findAsset, isFileSupported } = require('../files')

class InlinePlugin extends Plugin {
  run ({ fragment, attrs, keys, assets, options }) {
    if (fragment.tagName === 'style' && keys.includes('inline')) {
      const { content } = fragment.children[0]
      const tree = parse(content)
      walk(tree, node => {
        if (node.type === 'Url') {
          const { type, value } = node.value
          if (type === 'Raw' && isFileSupported(value)) {
            const asset = findAsset(value, assets, options)
            if (!asset) return
            const path = asset.path
            const parts = path.split('.')
            const extension = parts[parts.length - 1]
            node.value.value = `data:application/font-${extension};charset=utf-8;base64,${asset.base64}`
          }
        }
      })
      attrs = attrs.filter(attr => attr.key !== 'inline')
      fragment.children[0].content = generate(tree)
    }
  }
}

module.exports = InlinePlugin
