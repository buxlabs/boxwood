'use strict'

const { getTemplateAssignmentExpression } = require('../utilities/factory')
const { getTranslateCallExpression } = require('../utilities/translations')
const { stringify } = require('../utilities/html')
const walk = require('himalaya-walk')

const getSlotContent = (fragment, options) => {
  if (fragment.children.length === 0) { return '' }
  return stringify(fragment.children, '', options)
}

module.exports = function translate ({ tree, fragment, attrs, options, variables, filters, translations, languages }) {
  walk(fragment.children, node => {
    node.used = true
  })
  const content = getSlotContent(fragment, options)
  const attribute = attrs[0]
  const { key } = attribute
  const expression = getTranslateCallExpression(key, variables, content, filters, translations, languages)
  tree.append(getTemplateAssignmentExpression(options.variables.template, expression))
}
