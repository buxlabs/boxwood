'use strict'

const { unwrap } = require('pure-utilities/string')
const { getTemplateAssignmentExpression } = require('../utilities/factory')
const { getLiteral } = require('../utilities/ast')

module.exports = function ({ tree, attrs }) {
  const space = ' '
  let repeat = attrs.find(attr => attr.key === 'repeat')
  repeat = repeat ? repeat = unwrap(repeat.value, '{', '}') : 1
  return tree.append(getTemplateAssignmentExpression(null, getLiteral(space.repeat(repeat))))
}
