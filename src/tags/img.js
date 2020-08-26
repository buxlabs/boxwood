'use strict'

const { convertAttributeToInlineStyle, convertSizeToWidthAndHeight, setAutoDimension } = require('../utilities/css')
const { findAsset } = require('../utilities/files')
const normalizeNewline = require('normalize-newline')
const { getExtension, getBase64Extension } = require('../utilities/string')

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
        const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg']
        if (extensions.includes(extension)) {
          const path = attr.value
          const asset = findAsset(path, assets, options)
          if (!asset) return
          const string = asset.base64
          const content = normalizeNewline(string).trim()
          attr.value = `data:image/${getBase64Extension(extension)};base64,${content}`
        }
      }
      return attr
    }).filter(Boolean)
  }
}
