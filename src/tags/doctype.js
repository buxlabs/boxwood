'use strict'

const { getLiteral } = require('../utilities/ast')
const { getTemplateAssignmentExpression } = require('../utilities/factory')

module.exports = function ({ tree, options }) {
  tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral('<!doctype html>')))
}
