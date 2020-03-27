'use strict'

const { RESERVED_KEYWORDS } = require('./enum')

function placeholderName (keyword) {
  return `__${keyword.toUpperCase()}_PLACEHOLDER__`
}

function addPlaceholders (string) {
  RESERVED_KEYWORDS.forEach(keyword => {
    string = string.replace(new RegExp(`\\b${keyword}\\b`, 'g'), placeholderName(keyword))
  })
  return string
}

function removePlaceholders (node) {
  if (node.type === 'Identifier') {
    RESERVED_KEYWORDS.forEach(keyword => {
      if (node.name === placeholderName(keyword)) {
        node.name = keyword
      }
    })
  }
  return node
}

module.exports = {
  placeholderName,
  addPlaceholders,
  removePlaceholders
}
