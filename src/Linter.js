const walk = require('himalaya-walk')
const { extractComponentNames } = require('./extract')

module.exports = class Linter {
  lint (tree) {
    const data = this.analyze(tree)
    return this.verify(tree, data)
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

  verify ({ template }, data) {
    const warnings = []
    walk(template, node => {
      const index = data.components.indexOf(node.tagName)
      if (index !== -1) {
        data.components.splice(index, 1)
      }
    })
    data.components.forEach(component => {
      warnings.push({ type: 'UNUSED_COMPONENT', message: `${component} component is unused` })
    })
    return { warnings }
  }
}
