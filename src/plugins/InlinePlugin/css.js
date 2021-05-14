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

function cutStyles (css) {
  const styles = []
  const tree = parse(css)
  walk(tree, {
    visit: 'Rule',
    enter: node => {
      walk(node.prelude, {
        visit: 'ClassSelector',
        enter: leaf => {
          const { name } = leaf
          const block = generate(node.block)
          if (name && block) {
            const declaration = block
              .replace(/{|}/g, '')
              .replace(/"/g, "'")
            styles.push({ type: 'ClassSelector', className: leaf.name, declaration })
            node.used = true
          }
        }
      })
    }
  })
  walk(tree, {
    enter: (node, item, list) => {
      if (item && item.data && item.data.used) {
        list.remove(item)
      }
    }
  })
  const output = generate(tree)
  return { styles, output }
}

module.exports = { inlineUrls, cutStyles, convertElementValueToBase64 }
