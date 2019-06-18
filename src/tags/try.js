const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier } = require('../ast')
const { getTemplateVariableDeclaration, getTemplateAssignmentExpression, getTryStatement } = require('../factory')
const { TEMPLATE_VARIABLE } = require('../enum')

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
