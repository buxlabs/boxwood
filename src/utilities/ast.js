'use strict'

function getIdentifier (name) {
  return { type: 'Identifier', name }
}

function getLiteral (value) {
  return { type: 'Literal', value }
}

module.exports = { getIdentifier, getLiteral }
