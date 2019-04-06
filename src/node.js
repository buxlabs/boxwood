const { join } = require('path')

function hasShorthandSyntax (node) {
  return !!node.attributes.filter(attribute => attribute.key.includes('{') || attribute.key.includes('}')).length
}

function getComponentNames (node) {
  const omitted = ['{', '}', 'from']
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

module.exports = {
  hasShorthandSyntax,
  getComponentNames,
  getComponentPath
}
