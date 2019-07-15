const { join } = require('path')
const walk = require('himalaya-walk')
const { isImportTag } = require('./string')
const { isImage } = require('pure-conditions')
const { parse, walk: cssWalk } = require('css-tree')
const { isFileSupported } = require('./files')

function hasShorthandSyntax (node) {
  return !!node.attributes.filter(attribute => attribute.key.includes('{') || attribute.key.includes('}')).length
}

function getComponentNames (node) {
  const omitted = ['{', '}', 'from', 'partial']
  const keys = node.attributes.map(attribute => attribute.key).filter(key => !omitted.includes(key))
  return keys.join('').replace('{', '').replace('}', '').split(/,/g).map(key => key.trim())
}

// TODO: fixed this method
function hasExtension (path) {
  return path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js') || isImage(path) || path.endsWith('.json') || path.endsWith('.yaml')
}

function getAssetPath ({ attributes }, name) {
  const node = attributes.find(({ key }) => key === 'from' || key === 'partial' || key === 'src' || key === 'href')
  const path = node.value
  if (hasExtension(path)) {
    return path
  }
  return join(path, `${name}.html`)
}

function getAssetPaths (node, name) {
  if (isStyleWithInlineAttribute(node)) {
    return getAssetPathsFromStyleTag(node)
  }
  return [getAssetPath(node, name)]
}

function getAssetPathsFromStyleTag (node) {
  const paths = []
  const { content } = node.children[0]
  const tree = parse(content)
  cssWalk(tree, node => {
    if (node.type === 'Url') {
      let { type, value } = node.value
      value = value.replace(/'|"/g, '')
      if ((type === 'Raw' || type === 'String') && isFileSupported(value)) {
        paths.push(value)
      }
    }
  })
  return paths
}

function isPartialTag (name) {
  return name === 'partial' || name === 'render' || name === 'include'
}

function hasPartialAttribute (node) {
  return !!(node.attributes && node.attributes.find(attribute => attribute.key === 'partial'))
}

function isScriptWithInlineAttribute (node) {
  return node.tagName === 'script' && node.attributes.find(attribute => attribute.key === 'inline') &&
    node.attributes.find(attribute => attribute.key === 'src')
}

function isLinkWithInlineAttribute (node) {
  return node.tagName === 'link' && node.attributes.find(attribute => attribute.key === 'inline')
}

function isStyleWithInlineAttribute (node) {
  return node.tagName === 'style' && node.attributes.find(attribute => attribute.key === 'inline')
}

function isGlobalInlineLink (node, options) {
  return node.tagName === 'link' && options.inline.includes('stylesheets')
}

function isGlobalInlineScript (node, options) {
  return node.tagName === 'script' && options.inline.includes('scripts') &&
    node.attributes.find(attribute => attribute.key === 'src')
}

function isSvgTagWithFromAttribute (node) {
  return node.tagName === 'svg' && node.attributes.find(attribute => attribute.key === 'from')
}

function isImageTagWithInlineAttribute (node) {
  return node.tagName === 'img' && node.attributes.find(attribute => attribute.key === 'inline')
}

function isGlobalInlineImage (node, options) {
  return node.tagName === 'img' && options.inline.includes('images')
}

function isImageTagWithAutoWidthAttribute (node) {
  return node.tagName === 'img' && node.attributes.find(attribute => attribute.key === 'width' && attribute.value === 'auto')
}

function isImageTagWithAutoHeightAttribute (node) {
  return node.tagName === 'img' && node.attributes.find(attribute => attribute.key === 'height' && attribute.value === 'auto')
}

function isScriptTagWithI18nAttribute (node) {
  return node.tagName === 'script' && node.attributes.find(attribute => attribute.key === 'i18n') && node.attributes.find(attribute => attribute.key === 'from')
}

function isI18nTag (node) {
  return node.tagName === 'i18n' && node.attributes.find(attribute => attribute.key === 'from')
}

function isImageNode (node, options) {
  return !!(
    isImageTagWithInlineAttribute(node) ||
    isGlobalInlineImage(node, options) ||
    isImageTagWithAutoHeightAttribute(node) ||
    isImageTagWithAutoWidthAttribute(node)
  )
}

function getImportNodes (tree, options) {
  const nodes = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      nodes.push({ node, kind: 'IMPORT' })
    } else if (isPartialTag(node.tagName) || hasPartialAttribute(node)) {
      nodes.push({ node, kind: 'PARTIAL' })
    } else if (isScriptWithInlineAttribute(node) || isGlobalInlineScript(node, options)) {
      nodes.push({ node, kind: 'SCRIPT' })
    } else if (isLinkWithInlineAttribute(node) || isGlobalInlineLink(node, options) || isStyleWithInlineAttribute(node)) {
      nodes.push({ node, kind: 'STYLESHEET' })
    } else if (isSvgTagWithFromAttribute(node)) {
      nodes.push({ node, kind: 'SVG' })
    } else if (isImageNode(node, options)) {
      nodes.push({ node, kind: 'IMAGE' })
    } else if (isScriptTagWithI18nAttribute(node) || isI18nTag(node)) {
      nodes.push({ node, kind: 'TRANSLATION' })
    }
  })
  return nodes
}

module.exports = {
  hasShorthandSyntax,
  getComponentNames,
  getAssetPath,
  getAssetPaths,
  getImportNodes,
  isImageNode,
  isSVGNode: isSvgTagWithFromAttribute
}
