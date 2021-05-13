const { parse, walk, generate } = require('css-tree')
const { getExtension, getBase64Extension } = require('../../utilities/string')
const { findAsset, isFileSupported } = require('../../utilities/files')

function getBase64String (asset, options, isFont) {
  const { path, base64 } = asset
  const extension = getExtension(path)
  const dataType = isFont ? 'data:application/font-' : 'data:image/'
  return [
    `${dataType}${getBase64Extension(extension)}`,
    isFont && 'charset=utf-8',
    `base64,${base64}`
  ].filter(Boolean).join(';')
}

function convertElementValueToBase64 ({ element, value, assets, options, isFont }) {
  if (!isFileSupported(value)) return
  const asset = findAsset(value, assets, options)
  if (!asset) return
  element.value = getBase64String(asset, options, isFont)
}

function inlineUrls (css, assets, options) {
  const tree = parse(css)
  walk(tree, node => {
    if (node.type === 'Url') {
      let { type, value } = node.value
      value = value.replace(/'|"/g, '')
      convertElementValueToBase64({ element: node.value, value, assets, options, isFont: type === 'Raw' })
    }
  })
  return generate(tree)
}

module.exports = { inlineUrls, convertElementValueToBase64 }
