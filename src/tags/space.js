const { getTemplateAssignmentExpression } = require('../factory')
const { getLiteral } = require('../ast')
const { unwrap } = require('pure-utilities/string')

module.exports = function ({ tree, attrs }) {
  const space = ' '
  let repeat = attrs.find(attr => attr.key === 'repeat')
  repeat = repeat ? repeat = unwrap(repeat.value, '{', '}') : 1
  return tree.append(getTemplateAssignmentExpression(null, getLiteral(space.repeat(repeat))))
}
