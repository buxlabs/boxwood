const { parse, walk, generate } = require('../../utilities/css')
const { getExtension, getBase64Extension } = require('../../utilities/string')
const { findAsset, isFileSupported } = require('../../utilities/files')

function getBase64String (base64, path, options, isFont) {
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
  element.value = getBase64String(asset.base64, asset.path, options, isFont)
}

function inlineUrls (tree, assets, options) {
  walk(tree, node => {
    if (node.type === 'Url') {
      let { type, value } = node.value
      value = value.replace(/'|"/g, '')
      convertElementValueToBase64({ element: node.value, value, assets, options, isFont: type === 'Raw' })
    }
  })
  return tree
}

function cutStyles (tree) {
  const styles = []
  walk(tree, {
    visit: 'Rule',
    enter: node => {
      walk(node.prelude, leaf => {
        if (leaf.type === 'TypeSelector' || leaf.type === 'ClassSelector') {
          const { name } = leaf
          const block = generate(node.block)
          if (name && block) {
            const declaration = block
              .replace(/^{/, '')
              .replace(/}$/, '')
              .replace(/"/g, "'")
            styles.push({ type: leaf.type, name: leaf.name, declaration })
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
  return { styles, tree }
}

function updateStyleAttribute (fragment, declaration) {
  const styleAttribute = fragment.attributes.find(attribute => attribute.key === 'style')
  if (styleAttribute) {
    if (!styleAttribute.value.includes(declaration)) {
      fragment.attributes = fragment.attributes.map(attribute => {
        if (attribute.key === 'style') {
          attribute.value += ';'.concat(declaration)
        }
        return attribute
      })
    }
  } else {
    fragment.attributes.push({ key: 'style', value: declaration })
  }
}

function applyStylesInFragment (fragment, styles) {
  styles.filter(({ type }) => type === 'TypeSelector').forEach(style => {
    if (style.name === fragment.tagName) {
      const { declaration } = style
      updateStyleAttribute(fragment, declaration)
    }
  })

  const classAttribute = fragment.attributes.find(attribute => attribute.key === 'class')
  if (classAttribute) {
    const localStyles = classAttribute.value.split(/\s/).filter(Boolean) || []
    fragment.attributes = fragment.attributes
      .map(attribute => {
        if (attribute.key === 'class') {
          styles.filter(({ type }) => type === 'ClassSelector').forEach(({ name }) => {
            attribute.value = attribute.value.replace(name, '')
            attribute.value = attribute.value.replace(/\s+/, '')
            return attribute.value ? attribute : null
          })
        }
        return attribute
      })
      .filter(attribute => attribute.value)
    styles
      .filter(({ name, type }) => type === 'ClassSelector' && localStyles.includes(name))
      .forEach(({ declaration }) => {
        updateStyleAttribute(fragment, declaration)
      })
  }
}

function prepareStyles (css, assets, options) {
  let tree = parse(css)
  tree = inlineUrls(tree, assets, options)
  const result = cutStyles(tree)
  return { styles: result.styles, output: generate(result.tree) }
}

function removeEmptyStyleTag (fragment) {
  if (fragment.tagName === 'style' &&
    fragment.attributes.find(({ key }) => key === 'inline') &&
    fragment.children &&
    fragment.children.length === 1 &&
    fragment.children[0].content === ''
  ) {
    fragment.type = 'text'
    fragment.content = ''
    fragment.children = []
  }
}

module.exports = { prepareStyles, applyStylesInFragment, removeEmptyStyleTag, convertElementValueToBase64 }
