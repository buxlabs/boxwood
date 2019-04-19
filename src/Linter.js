const walk = require('himalaya-walk')
const { extractComponentNames } = require('./extract')
const { HtmlValidate } = require('html-validate')
const { VOID_TAGS } = require('./enum')
const linter = new HtmlValidate()
const { isImportTag } = require('./string')
const { unique, duplicates } = require('pure-utilities/array')
const { getComponentNames, getAssetPaths } = require('./node')

function analyze (tree) {
  const components = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      const names = extractComponentNames(node.attributes)
      names.forEach(name => components.push(name))
    }
  })
  return { components: unique(components) }
}

function isClosingTagError (message) {
  for (let tag of VOID_TAGS) {
    if (message.message.includes(tag)) return false
  }
  return message.ruleId === 'close-order' || message.ruleId === 'no-implicit-close'
}

module.exports = class Linter {
  lint (tree, source, imports = []) {
    const invalidHtmlWarnings = this.verifyHTML(source)
    const importsWarnings = this.verifyImports(imports)
    const unusedComponentsWarnings = this.verifyComponents(tree)
    const warnings = unusedComponentsWarnings.concat(invalidHtmlWarnings, importsWarnings)
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

  verifyImports (imports) {
    const warnings = []
    const allNames = []
    let allPaths = []
    imports.forEach(node => {
      const names = getComponentNames(node)
      names.forEach(name => {
        if (allNames.includes(name)) {
          warnings.push({ message: `Component name duplicate: ${name}`, type: 'COMPONENT_NAME_DUPLICATE' })
        } else {
          allNames.push(name)
        }
      })
    })
    imports.forEach(node => { allPaths = allPaths.concat(getAssetPaths(node)) })
    duplicates(allPaths).forEach(duplicate => {
      warnings.push({ message: `Component path duplicate: ${duplicate}`, type: 'COMPONENT_PATH_DUPLICATE' })
    })
    return warnings
  }

  verifyHTML (source) {
    try {
      const { results } = linter.validateString(source)
      const warnings = []
      results.forEach(result => {
        result.messages.forEach(message => {
          if (isClosingTagError(message)) {
            const tagName = message.message.match(/'?<\/?\w+'?>/g)[0].replace('\'', '')
            warnings.push({ type: 'UNCLOSED_TAG', message: `Unclosed tag ${tagName} in line ${message.line}` })
          }
        })
      })
      return warnings
    } catch (exception) {
      return []
    }
  }
}
