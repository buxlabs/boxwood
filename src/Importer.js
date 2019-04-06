const walk = require('himalaya-walk')
const fs = require('fs')
const { join } = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const { isImportTag } = require('./string')
const { flatten } = require('pure-utilities/collection')
const { getComponentNames, getComponentPath } = require('./node')
const parse = require('./html/parse')

function findImportNodes (tree) {
  const nodes = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      nodes.push(node)
    }
  })
  return nodes
}

async function loadComponent (path, paths = []) {
  let result
  for (let option of paths) {
    try {
      const location = join(option, path)
      result = {}
      result.path = location
      result.source = await readFile(location, 'utf8')
      break
    } catch (exception) {}
  }
  return result
}

async function fetch (node, context, options) {
  const names = getComponentNames(node)
  return Promise.all(names.map(async name => {
    const { source, path } = await loadComponent(getComponentPath(node, name), options.paths)
    const tree = parse(source)
    const files = [context]
    const warnings = []
    return { name, source, path, files, warnings, tree }
  }))
}

async function recursiveImport (tree, path, options) {
  const imports = findImportNodes(tree)
  const components = await Promise.all(imports.map(node => fetch(node, path, options)))
  const current = flatten(components)
  const nested = await Promise.all(current.map(async element => {
    return recursiveImport(element.tree, element.path, options)
  }))
  return current.concat(flatten(nested))
}

module.exports = class Importer {
  constructor (source, options = {}) {
    this.tree = parse(source)
    this.options = options
  }
  async import () {
    return recursiveImport(this.tree, '.', this.options)
  }
}
