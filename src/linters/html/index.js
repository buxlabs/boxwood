'use strict'

const walk = require('himalaya-walk')
const { parse } = require('../../utilities/html')
const { verifyTags } = require('./tag')
const { verifyComponents } = require('./component')
const { verifyImports } = require('./import')


function lint (source, imports = [], options = {}) {
  const tree = parse(source)
  return [
    ...verifyTags(tree),
    ...verifyComponents(tree),
    ...verifyImports(imports, options)
  ]
}

module.exports = { lint }
