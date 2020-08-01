'use strict'

const { Literal, Identifier } = require('abstract-syntax-tree')

function getIdentifier (name) {
  return new Identifier({ name })
}

function getLiteral (value) {
  return new Literal({ value })
}

module.exports = { getIdentifier, getLiteral }
