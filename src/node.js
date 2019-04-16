const { join } = require('path')
const walk = require('himalaya-walk')
const { isImportTag } = require('./string')
const { isImage } = require('pure-conditions')

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
  return path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js') || isImage(path)
}

function getComponentPath ({ attributes }, name) {
  const node = attributes.find(({ key }) => key === 'from' || key === 'partial' || key === 'src' || key === 'href')
  const path = node.value
  if (hasExtension(path)) {
    return path
  }
  return join(path, `${name}.html`)
}

function isPartialTag (name) {
  return name === 'partial' || name === 'render' || name === 'include'
}

function hasPartialAttribute (node) {
  return !!(node.attributes && node.attributes.find(attribute => attribute.key === 'partial'))
}

function isScriptWithInlineAttribute (node) {
  return node.tagName === 'script' && node.attributes.find(attribute => attribute.key === 'inline')
}

function isLinkWithInlineAttribute (node) {
  return node.tagName === 'link' && node.attributes.find(attribute => attribute.key === 'inline')
}

function isGlobalInlineLink (node, options) {
  return node.tagName === 'link' && options.inline.includes('stylesheets')
}

function isGlobalInlineScript (node, options) {
  return node.tagName === 'script' && options.inline.includes('scripts')
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

function getImportNodes (tree, options) {
  const nodes = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      nodes.push({ node, kind: 'IMPORT' })
    } else if (isPartialTag(node.tagName) || hasPartialAttribute(node)) {
      nodes.push({ node, kind: 'PARTIAL' })
    } else if (isScriptWithInlineAttribute(node) || isGlobalInlineScript(node, options)) {
      nodes.push({ node, kind: 'SCRIPT' })
    } else if (isLinkWithInlineAttribute(node) || isGlobalInlineLink(node, options)) {
      nodes.push({ node, kind: 'STYLESHEET' })
    } else if (isSvgTagWithFromAttribute(node)) {
      nodes.push({ node, kind: 'SVG' })
    } else if (isImageTagWithInlineAttribute(node) || isGlobalInlineImage(node, options) || isImageTagWithAutoHeightAttribute(node) || isImageTagWithAutoWidthAttribute(node)) {
      nodes.push({ node, kind: 'IMAGE' })
    }
  })
  return nodes
}

module.exports = {
  hasShorthandSyntax,
  getComponentNames,
  getComponentPath,
  getImportNodes
}
