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

function isExternalUrl (url) {
  if (!url) { return false }
  return url.startsWith('http://') || url.startsWith('https://')
}

module.exports = class Linter {
  lint (tree, source, imports = [], options = {}) {
    return [
      ...this.verifyTags(tree),
      ...this.verifyComponents(tree),
      ...this.verifyImports(imports, options)
    ]
  }

  verifyTags (tree) {
    const ANCHOR_TAG = 'a'
    const IMAGE_TAG = 'img'
    const warnings = []
    const { components } = analyze(tree)
    walk(tree, node => {
      if (node.tagName === ANCHOR_TAG && !components.includes(ANCHOR_TAG)) {
        const href = node.attributes.find(attribute => attribute.key === 'href')
        if (href && isExternalUrl(href.value)) {
          const rel = node.attributes.find(attribute => attribute.key === 'rel')
          if (!rel) {
            warnings.push({ message: `${ANCHOR_TAG} tag with external href should have a rel attribute (e.g. rel="noopener")`, type: 'REL_ATTRIBUTE_MISSING' })
          }
        }
      }

      if (node.tagName === IMAGE_TAG && !components.includes(IMAGE_TAG)) {
        const alt = node.attributes.find(attribute => attribute.key === 'alt' || attribute.key.startsWith('alt|'))
        if (!alt) {
          warnings.push({ message: `${IMAGE_TAG} tag should have an alt attribute`, type: 'ALT_ATTRIBUTE_MISSING' })
        }
      }
    })
    return warnings
  }

  verifyComponents (tree) {
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
