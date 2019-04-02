const walk = require('himalaya-walk')
const { extractComponentNames } = require('./extract')
const { HtmlValidate } = require('html-validate')
const linter = new HtmlValidate()

module.exports = class Linter {
  async lint (tree, source) {
    const unusedComponentsWarnings = this.verifyComponents(tree)
    const invalidHtmlWarnings = await this.verifyHTML(source)
    const warnings = unusedComponentsWarnings.concat(invalidHtmlWarnings)
    return { warnings }
  }

  verifyComponents (tree) {
    const warnings = []
    const data = this.analyze(tree)
    walk(tree.template, node => {
      const index = data.components.indexOf(node.tagName)
      if (index !== -1) {
        data.components.splice(index, 1)
      }
    })
    data.components.forEach(component => {
      warnings.push({ type: 'UNUSED_COMPONENT', message: `${component} component is unused` })
    })
    return warnings
  }

  analyze ({ template }) {
    const components = []
    walk(template, node => {
      if (node.tagName === 'import' || node.tagName === 'require') {
        const names = extractComponentNames(node.attributes)
        names.forEach(name => components.push(name))
      }
    })
    return { components }
  }

  verifyHTML (source) {
    if (source.includes('import') || source.includes('require')) return []
    return new Promise(resolve => {
      const { results } = linter.validateString(source)
      if (results.length === 0) return resolve([])
      const warnings = []
      results.forEach(result => {
        result.messages.forEach(message => {
          if (message.ruleId === 'close-order' || message.ruleId === 'no-implicit-close') {
            warnings.push({ type: 'UNCLOSED_TAG', message: `Unclosed tag in line ${message.line}` })
          }
        })
      })
      return resolve(warnings)
    })
  }
}
