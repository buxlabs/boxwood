const { convertAttributeToInlineStyle, convertSizeToWidthAndHeight, setAutoDimension } = require('../css')
const { findAsset } = require('../files')
const normalizeNewline = require('normalize-newline')

function getExtension (value) {
  const parts = value.split('.')
  const extension = parts[parts.length - 1]
  return extension === 'svg' ? 'svg+xml' : extension
}

module.exports = function ({ fragment, attrs, keys, assets, options }) {
  convertAttributeToInlineStyle(attrs, ['fluid', 'responsive'], 'max-width: 100%; height: auto;')
  convertAttributeToInlineStyle(attrs, ['cover'], 'object-fit: cover; object-position: right top;')
  convertAttributeToInlineStyle(attrs, ['contain'], 'object-fit: contain; object-position: center;')
  convertSizeToWidthAndHeight(attrs)
  setAutoDimension(attrs, keys, 'width', assets, options)
  setAutoDimension(attrs, keys, 'height', assets, options)
  if (keys.includes('inline') || options.inline.includes('images')) {
    fragment.attributes = fragment.attributes.map(attr => {
      if (attr.key === 'inline') return null
      if (attr.key === 'src') {
        const extension = getExtension(attr.value)
        const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg+xml']
        if (extensions.includes(extension)) {
          const path = attr.value
          const asset = findAsset(path, assets, options)
          if (!asset) return
          const string = asset.base64
          const content = normalizeNewline(string).trim()
          attr.value = `data:image/${extension};base64, ${content}`
        }
      }
      return attr
    }).filter(Boolean)
  }
}
