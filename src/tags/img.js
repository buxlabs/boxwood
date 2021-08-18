'use strict'

const { findAsset } = require('../utilities/files')
const { getExtension, getBase64Extension, normalizeNewline } = require('../utilities/string')

module.exports = function ({ fragment, attrs, keys, assets, options }) {
  if (keys.includes('inline')) {
    fragment.attributes = fragment.attributes.map(attr => {
      if (attr.key === 'inline') return null
      if (attr.key === 'src') {
        const extension = getExtension(attr.value)
        const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg']
        if (extensions.includes(extension)) {
          const path = attr.value
          const asset = findAsset(path, assets, options)
          if (!asset) return null
          const string = asset.base64
          const content = normalizeNewline(string).trim()
          attr.value = `data:image/${getBase64Extension(extension)};base64,${content}`
        }
      }
      return attr
    }).filter(Boolean)
  }
}
