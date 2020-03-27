'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier } = require('../utilities/ast')
const { getTemplateVariableDeclaration, getTemplateAssignmentExpression, getTryStatement } = require('../utilities/factory')
const { TEMPLATE_VARIABLE } = require('../utilities/enum')

module.exports = function ({ fragment, tree, options, collectChildren }) {
  const ast = new AbstractSyntaxTree('')
  const variable = `_${TEMPLATE_VARIABLE}`
  options.variables.template = variable
  ast.append(getTemplateVariableDeclaration(variable))
  collectChildren(fragment, ast)
  ast.append(getTemplateAssignmentExpression(TEMPLATE_VARIABLE, getIdentifier(variable)))
  options.variables.template = TEMPLATE_VARIABLE
  tree.append(getTryStatement(ast.body))
}
