'use strict'

function getComponentNames (attributes) {
  const omitted = ['{', '}', 'from', 'partial']
  const keys = attributes.map(attribute => attribute.key).filter(key => !omitted.includes(key))
  return keys.join('').replace('{', '').replace('}', '').split(/,/g).map(key => key.trim())
}

function findAttributeByKey (attributes, key) {
  if (!attributes) { return }
  return attributes.find(attr => attr.key === key)
}

module.exports = {
  getComponentNames,
  findAttributeByKey
}
