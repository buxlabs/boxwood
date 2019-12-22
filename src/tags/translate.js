const { getTemplateAssignmentExpression } = require('../utilities/factory')
const { getTranslateCallExpression } = require('../utilities/translations')

module.exports = function translate ({ tree, fragment, attrs, options, variables, filters, translations, languages }) {
  const attribute = attrs[0]
  const { key } = attribute
  const expression = getTranslateCallExpression(key, variables, filters, translations, languages)
  tree.append(getTemplateAssignmentExpression(options.variables.template, expression))
}
