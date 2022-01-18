'use strict'

const { parse } = require('../../utilities/html')
const { verifyBrackets } = require('./bracket')
const { verifyTags } = require('./tag')
const { verifyComponents } = require('./component')
const { verifyImports } = require('./import')

function lint (source, imports = [], options = {}) {
  const tree = parse(source)
  return [
    ...verifyBrackets(source),
    ...verifyTags(tree),
    ...verifyComponents(tree),
    ...verifyImports(imports, options)
  ]
}

module.exports = { lint }
