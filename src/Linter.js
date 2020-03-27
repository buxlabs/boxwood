'use strict'

const walk = require('himalaya-walk')
const { isImportTag } = require('./utilities/string')
const { unique, duplicates } = require('pure-utilities/array')
const { getComponentNames } = require('./utilities/attributes')
const { getAssetPaths, isImageNode, isSVGNode } = require('./utilities/node')

function analyze (tree) {
  const components = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      const names = getComponentNames(node.attributes)
      names.forEach(name => components.push(name))
    }
  })
  return { components: unique(components) }
}

module.exports = class Linter {
  lint (tree, source, imports = [], options = {}) {
    const importsWarnings = this.verifyImports(imports, options)
    const unusedComponentsWarnings = this.verifyComponents(tree)
    const warnings = unusedComponentsWarnings.concat(importsWarnings)
    return warnings
  }

  verifyComponents (tree) {
    const warnings = []
    const data = analyze(tree)
    walk(tree, node => {
      const index = data.components.indexOf(node.tagName)
      if (index !== -1) {
        data.components.splice(index, 1)
      }
    })
    // TODO: unify warnings.
    data.components.forEach(component => {
      warnings.push({ type: 'UNUSED_COMPONENT', message: `${component} component is unused` })
    })
    return warnings
  }

  verifyImports (imports, options) {
    const warnings = []
    const allNames = []
    let allPaths = []
    imports.forEach(node => {
      if (isImportTag(node.tagName)) {
        const names = getComponentNames(node.attributes)
        names.forEach(name => {
          if (allNames.includes(name)) {
            warnings.push({ message: `Component name duplicate: ${name}`, type: 'COMPONENT_NAME_DUPLICATE' })
          } else {
            allNames.push(name)
          }
        })
      }
    })
    imports.forEach(node => {
      let assetPaths = getAssetPaths(node)
      if (isImageNode(node, options) || isSVGNode(node)) {
        assetPaths = assetPaths.filter(item => !assetPaths.includes(item))
      }
      allPaths = allPaths.concat(assetPaths)
    })
    duplicates(allPaths).forEach(duplicate => {
      warnings.push({ message: `Component path duplicate: ${duplicate}`, type: 'COMPONENT_PATH_DUPLICATE' })
    })
    return warnings
  }
}
