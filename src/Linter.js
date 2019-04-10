const walk = require('himalaya-walk')
const { extractComponentNames } = require('./extract')
const { HtmlValidate } = require('html-validate')
const { VOID_TAGS } = require('./enum')
const linter = new HtmlValidate()
const { isImportTag } = require('./string')
const { unique } = require('pure-utilities/array')

module.exports = class Linter {
  lint (tree, source) {
    const unusedComponentsWarnings = this.verifyComponents(tree)
    const invalidHtmlWarnings = this.verifyHTML(source)
    const warnings = unusedComponentsWarnings.concat(invalidHtmlWarnings)
    return { warnings }
  }

  verifyComponents (tree) {
    const warnings = []
    const data = this.analyze(tree)
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

  analyze (tree) {
    const components = []
    walk(tree, node => {
      if (isImportTag(node.tagName)) {
        const names = extractComponentNames(node.attributes)
        names.forEach(name => components.push(name))
      }
    })
    return { components: unique(components) }
  }

  verifyHTML (source) {
    const { results } = linter.validateString(source)
    const warnings = []
    results.forEach(result => {
      result.messages.forEach(message => {
        if (this.isClosingTagError(message)) {
          const tagName = message.message.match(/'?<\/?\w+'?>/g)[0].replace('\'', '')
          warnings.push({ type: 'UNCLOSED_TAG', message: `Unclosed tag ${tagName} in line ${message.line}` })
        }
      })
    })
    return warnings
  }

  isClosingTagError (message) {
    for (let tag of VOID_TAGS) {
      if (message.message.includes(tag)) return false
    }
    return message.ruleId === 'close-order' || message.ruleId === 'no-implicit-close'
  }
}
