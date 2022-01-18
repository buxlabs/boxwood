'use strict'

const walk = require('himalaya-walk')
const { unique } = require('pure-utilities/array')
const { isImportTag } = require('../../utilities/string')
const { getComponentNames } = require('../../utilities/attributes')

function isStyleImport (node) {
  const from = node.attributes.find(attr => attr.key === 'from')
  if (from && from.value.endsWith('.css')) {
    return true
  }
  return false
}


function analyze (tree) {
  const components = []
  walk(tree, node => {
    if (isImportTag(node.tagName) && !isStyleImport(node)) {
      const names = getComponentNames(node.attributes)
      names.forEach(name => components.push(name))
    }
  })
  return { components: unique(components) }
}

function verifyComponents (tree) {
  const warnings = []
  const { components } = analyze(tree)
  walk(tree, node => {
    const index = components.indexOf(node.tagName)
    if (index !== -1) {
      components.splice(index, 1)
    }
  })
  // TODO: unify warnings.
  components.forEach(component => {
    warnings.push({ type: 'UNUSED_COMPONENT', message: `${component} component is unused` })
  })
  return warnings
}

module.exports = { verifyComponents, analyze }
