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

function getComponentPath (node, name) {
  const length = node.attributes.length
  let path = node.attributes[length - 1].value
  if (path.endsWith('.html')) {
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

function getImportNodes (tree) {
  const nodes = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      nodes.push(node)
    } else if (isPartialTag(node.tagName)) {
      nodes.push(node)
    } else if (hasPartialAttribute(node)) {
      nodes.push(node)
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
