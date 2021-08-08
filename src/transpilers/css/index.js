'use strict'

const { parse, walk, generate } = require('css-tree')
const createHash = require('string-hash')

function transpile (source) {
  const hash = createHash(source)
  const tree = parse(source)
  walk(tree, node => {
    if (node.type === 'ClassSelector') {
      node.name = `${node.name}-${hash}`
    }
  })
  return generate(tree)
}

module.exports = { transpile }
