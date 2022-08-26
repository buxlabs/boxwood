'use strict'

const { parse: parseHTML, stringify: stringifyHTML } = require('himalaya')
const walk = require('himalaya-walk')

function parse (source, options) {
  return parseHTML(source, options)
}

function stringify (tree, options) {
  return stringifyHTML(tree, options)
}

module.exports = {
  parse,
  stringify,
  walk
}
