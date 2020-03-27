'use strict'

const { getTemplateAssignmentExpression } = require('../utilities/factory')
const { getLiteral } = require('../utilities/ast')
const ALIASES = {
  'non-breaking space': ' ',
  'less than': '<',
  'greater than': '>',
  ampersand: '&',
  'double quotation mark': '"',
  'single quotation mark': '\'',
  copyright: '©',
  'registered trademark': '®'
}

module.exports = function ({ tree, options, attrs }) {
  let identifier = attrs.reduce((accumulator, attribute) => {
    accumulator += `${attribute.key} `
    return accumulator
  }, '')
  identifier = identifier.trim()
  const literal = getLiteral(ALIASES[identifier] || `&${identifier};`)
  return tree.append(getTemplateAssignmentExpression(options.variables.template, literal))
}
