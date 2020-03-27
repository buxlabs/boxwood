'use strict'

const normalizeNewline = require('normalize-newline')
const { SVGError } = require('../utilities/errors')
const { findAsset } = require('../utilities/files')
const { parse } = require('../utilities/html')

module.exports = function ({ fragment, attrs, assets, options }) {
  const attr = attrs.find(attr => attr.key === 'from')
  const { value: path } = attr
  if (!path) { throw new SVGError('Attribute empty on the svg tag: from.') }
  const asset = findAsset(path, assets, options)
  if (!asset) return false
  const content = parse(normalizeNewline(asset.source).trim())[0]
  fragment.attributes = content.attributes
  fragment.children = content.children
  return true
}
