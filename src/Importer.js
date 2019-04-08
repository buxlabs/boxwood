const walk = require('himalaya-walk')
const fs = require('fs')
const { join, dirname } = require('path')
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
  for (let option of paths) {
    try {
      const location = join(option, path)
      const result = {}
      result.path = location
      result.source = await readFile(location, 'utf8')
      return result
    } catch (exception) {}
  }
  return {}
}

async function fetch (node, context, options) {
  const names = getComponentNames(node)
  return Promise.all(names.map(async name => {
    const dir = dirname(context)
    const { source, path } = await loadComponent(getComponentPath(node, name), [dir, ...options.paths])
    if (!path) {
      return {
        warnings: [{ type: 'COMPONENT_NOT_FOUND', message: `Component not found: ${name}` }]
      }
    }
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
  const nested = await Promise.all(current.filter(element => element.tree).map(async element => {
    return recursiveImport(element.tree, element.path, options)
  }))
  let files = current.concat(flatten(nested.map(object => object.components)))
  const object = {}
  files.forEach(file => {
    if (!object[file.path]) {
      object[file.path] = file
    } else {
      object[file.path].files = object[file.path].files.concat(file.files)
    }
  })
  files = Object.values(object)
  return {
    components: files,
    warnings: flatten(files.map(file => file.warnings))
  }
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
