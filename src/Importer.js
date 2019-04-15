const fs = require('fs')
const { join, dirname } = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const { flatten } = require('pure-utilities/collection')
const Linter = require('./Linter')

const { getComponentNames, getComponentPath, getImportNodes } = require('./node')
const parse = require('./html/parse')
const linter = new Linter()

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
  const paths = options.paths || []
  const names = getComponentNames(node)
  return Promise.all(names.map(async name => {
    const type = name ? 'COMPONENT' : 'PARTIAL'
    const dir = dirname(context)
    const { source, path } = await loadComponent(getComponentPath(node, name), [dir, ...paths])
    if (!path) {
      return {
        warnings: [{ type: 'COMPONENT_NOT_FOUND', message: `Component not found: ${name}` }]
      }
    }
    const tree = parse(source)
    const files = [context]
    const warnings = []
    return { name, source, path, files, warnings, tree, type }
  }))
}
const MAXIMUM_IMPORT_DEPTH = 50
async function recursiveImport (tree, source, path, options, depth) {
  if (depth > MAXIMUM_IMPORT_DEPTH) {
    return {
      assets: [],
      warnings: [{ type: 'MAXIMUM_IMPORT_DEPTH_EXCEEDED', message: 'Maximum import depth exceeded' }]
    }
  }
  const imports = getImportNodes(tree)
  const warnings = linter.lint(tree, source, imports)
  const assets = await Promise.all(imports.map(node => fetch(node, path, options)))
  const current = flatten(assets)
  const nested = await Promise.all(current.filter(element => element.tree).map(async element => {
    return recursiveImport(element.tree, element.source, element.path, options, depth + 1)
  }))
  let nestedAssets = current.concat(flatten(nested.map(object => object.assets)))
  nestedAssets = mergeAssets(nestedAssets)
  const nestedWarnings = warnings.concat(flatten(nested.map(object => object.warnings)))
  return {
    assets: nestedAssets,
    warnings: nestedWarnings.concat(flatten(nestedAssets.map(file => file.warnings)))
  }
}

function mergeAssets (assets) {
  const object = {}
  assets.forEach(component => {
    const { path, files } = component
    if (!object[path]) {
      object[path] = component
    } else {
      object[path].files = [...object[path].files, ...files]
    }
  })
  return Object.values(object)
}

module.exports = class Importer {
  constructor (source, options = {}) {
    this.source = source
    this.tree = parse(source)
    this.options = options
  }
  async import () {
    return recursiveImport(this.tree, this.source, '.', this.options, 0)
  }
}
