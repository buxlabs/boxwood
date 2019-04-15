const { join } = require('path')
const walk = require('himalaya-walk')
const { isImportTag } = require('./string')

function hasShorthandSyntax (node) {
  return !!node.attributes.filter(attribute => attribute.key.includes('{') || attribute.key.includes('}')).length
}

function getComponentNames (node) {
  const omitted = ['{', '}', 'from', 'partial']
  const keys = node.attributes.map(attribute => attribute.key).filter(key => !omitted.includes(key))
  return keys.join('').replace('{', '').replace('}', '').split(/,/g).map(key => key.trim())
}

function getComponentPath ({ attributes }, name) {
  const node = attributes.find(({ key }) => key === 'from' || key === 'partial' || key === 'src' || key === 'href')
  const path = node.value
  if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js')) {
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

function getImportNodes (tree) {
  const nodes = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      nodes.push({ node, kind: 'IMPORT' })
    } else if (isPartialTag(node.tagName) || hasPartialAttribute(node)) {
      nodes.push({ node, kind: 'PARTIAL' })
    } else if (isScriptWithInlineAttribute(node)) {
      nodes.push({ node, kind: 'SCRIPT' })
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
