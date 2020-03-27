'use strict'

const { findAsset } = require('./files')
const size = require('image-size')

function addAttribute (attrs, key, value) {
  const index = attrs.findIndex(attr => attr.key === key)
  if (index === -1) {
    attrs.push({ key, value })
  } else {
    attrs[index].value = `${value} ${attrs[index].value}`
  }
}

function overrideAttribute (attributes, key, value) {
  const attribute = attributes.find(attribute => attribute.key === key)
  if (attribute) {
    attribute.value = value
  } else {
    attributes.push({ key, value })
  }
  return attributes
}

function convertAttributeToInlineStyle (attrs, attributeNames, styles) {
  const index = attrs.findIndex(attr => attributeNames.includes(attr.key))
  if (index !== -1) {
    attrs.splice(index, 1)
    addAttribute(attrs, 'style', styles)
  }
  return attrs
}

function convertSizeToWidthAndHeight (attrs) {
  const sizeAttributeIndex = attrs.findIndex(attr => attr.key === 'size')
  if (sizeAttributeIndex !== -1) {
    const [width, height] = attrs[sizeAttributeIndex].value.split(/\D/)
    attrs.splice(sizeAttributeIndex, 1)
    // TODO add specs for interpolated values
    overrideAttribute(attrs, 'width', width)
    overrideAttribute(attrs, 'height', height)
  }
  return attrs
}

function setAutoDimension (attrs, keys, dimension, assets, options) {
  if (keys.includes(dimension)) {
    const attr = attrs.find(attr => attr.key === dimension)
    if (attr.value === 'auto') {
      const { value: path } = attrs.find(attr => attr.key === 'src')
      const asset = findAsset(path, assets, options)
      if (!asset) return
      try {
        const dimensions = size(asset.buffer)
        attr.value = dimensions[dimension].toString()
      } catch (exception) {
        // TODO: Add a warning. The image cannot be parsed.
      }
    }
  }
}

module.exports = { convertAttributeToInlineStyle, convertSizeToWidthAndHeight, setAutoDimension }
