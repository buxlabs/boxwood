'use strict'

const { getTemplateAssignmentExpression } = require('../utilities/factory')
const { getLiteral } = require('../utilities/ast')
module.exports = function ({ fragment, tree, options }) {
  const { spacing } = options.styles
  const { key } = fragment.attributes.find(attribute => Object.keys(spacing).includes(attribute.key))
  const value = spacing[key]
  tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(`<div style="height:${value}"></div>`)))
}
