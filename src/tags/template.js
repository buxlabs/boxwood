'use strict'

const { getLiteral } = require('../utilities/ast')
const { getTemplateAssignmentExpression } = require('../utilities/factory')

module.exports = function ({ tree, fragment, options }) {
  let content = '<template'
  fragment.attributes.forEach(attribute => {
    if (attribute.value) {
      content += ` ${attribute.key}="${attribute.value}"`
    } else {
      content += ` ${attribute.key}`
    }
  })
  content += '>'
  fragment.children.forEach(node => {
    node.used = true
    content += node.content
  })
  content += '</template>'
  tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(content)))
}
