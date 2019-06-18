const { getObjectMemberExpression } = require('./factory')
const { convertText } = require('./convert')

function isStaticTranslationKey (key) {
  return !isDynamicTranslationKey(key)
}
function isDynamicTranslationKey (key) {
  return key.includes('{') && key.includes('}')
}
function getTranslationNode (key, variables, filters, translations, languages) {
  if (isStaticTranslationKey(key)) {
    return {
      type: 'Literal',
      value: key
    }
  }
  const nodes = convertText(key, variables, filters, translations, languages)
  const node = nodes[0]
  if (node.type === 'ExpressionStatement') return node.expression
  return node
}
function getTranslateCallExpression (key, variables, filters, translations, languages) {
  const node = getTranslationNode(key, variables, filters, translations, languages)
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'translate'
    },
    arguments: [
      node,
      getObjectMemberExpression('language')
    ]
  }
}
module.exports = { getTranslateCallExpression }
