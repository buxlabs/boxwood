'use strict'

const { parse, walk, generate } = require('../../utilities/css')
const createHash = require('string-hash')
const { camelize } = require('pure-utilities/string')

function transpile (source) {
  const hash = createHash(source)
  const tree = parse(source)
  walk(tree, node => {
    if (node.type === 'ClassSelector') {
      node.name = `${camelize(node.name)}-${hash}`
    }
    if (node.type === 'TypeSelector') {
      node.type = 'ClassSelector'
      node.name = `${camelize(node.name)}-${hash}`
    }
  })
  return generate(tree)
}

function getSelectors (source) {
  const tree = parse(source)
  const selectors = {}
  walk(tree, node => {
    if (node.type === 'ClassSelector') {
      const [key] = node.name.split('-')
      selectors[key] = node.name
    }
  })
  return selectors
}

module.exports = { transpile, getSelectors }
