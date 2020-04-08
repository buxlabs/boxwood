'use strict'

const { getObjectMemberExpression } = require('./factory')
const { convertText, modify } = require('./convert')
const { isPlainObject } = require('pure-conditions')

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
function getTranslateCallExpression (key, variables, content, filters, translations, languages) {
  const usedFilters = []
  key = key.replace(/\|[a-z]+/g, match => {
    const filter = match.replace('|', '')
    usedFilters.push(filter)
    filters.push(filter)
    return ''
  })
  if (content) {
    const translation = translations[key]
    if (Array.isArray(translation)) {
      translations[key] = translations[key].map((translation) => {
        return translation.replace(/{\s*slot\s*}/, content)
      })
    } else if (isPlainObject(translation)) {
      for (const key in translation) {
        if (Object.prototype.hasOwnProperty.call(translation, key)) {
          translation[key] = translation[key].replace(/{\s*slot\s*}/, content)
        }
      }
    }
  }
  const node = getTranslationNode(key, variables, filters, translations, languages)
  const objectMemberExpression = getObjectMemberExpression('language')
  objectMemberExpression.property.inlined = true
  return modify({
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'translate'
    },
    arguments: [node, objectMemberExpression]
  }, variables, usedFilters)
}
module.exports = { getTranslateCallExpression }
