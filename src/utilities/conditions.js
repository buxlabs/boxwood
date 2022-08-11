'use strict'

const { normalize } = require('./array')
const { convertKey } = require('./convert')

function getCondition (attrs, variables, filters, translations, languages, warnings) {
  const attributes = normalize(attrs, warnings)
  const keys = attributes.map(attr => attr.key)
  const key = keys[0]
  return convertKey(key, variables, filters, translations, languages)
}

module.exports = { getCondition }
