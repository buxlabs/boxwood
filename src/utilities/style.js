'use strict'

const { flatten } = require('pure-utilities/collection')
const { dasherize, hyphenate } = require('./string')

function convertObjectToStyleString (input) {
  const object = flatten(input)
  return Object.keys(object)
    .map(attribute => {
      return hyphenate(dasherize(attribute)) + ':' + object[attribute] + ';'
    })
    .join('')
}

module.exports = { convertObjectToStyleString }
