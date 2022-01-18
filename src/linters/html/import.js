const { duplicates } = require('pure-utilities/array')
const { getAssetPaths, isImageNode } = require('../../utilities/node')
const { isImportTag } = require('../../utilities/string')
const { getComponentNames } = require('../../utilities/attributes')

function verifyImports (imports, options) {
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
    if (isImageNode(node, options)) {
      assetPaths = assetPaths.filter(item => !assetPaths.includes(item))
    }
    allPaths = allPaths.concat(assetPaths)
  })
  duplicates(allPaths).forEach(duplicate => {
    warnings.push({ message: `Component path duplicate: ${duplicate}`, type: 'COMPONENT_PATH_DUPLICATE' })
  })
  return warnings
}

module.exports = { verifyImports }
