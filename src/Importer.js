const walk = require('himalaya-walk')
const fs = require('fs')
const { join, dirname } = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const { isImportTag } = require('./string')
const { flatten } = require('pure-utilities/collection')
const { unique } = require('pure-utilities/array')

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

function validateImports (imports) {
  const warnings = []
  const allNames = []
  const allPaths = []
  imports.forEach(node => {
    const names = getComponentNames(node)
    names.forEach(name => {
      if (allNames.includes(name)) {
        warnings.push({ message: `Component name duplicate: ${name}`, type: 'COMPONENT_NAME_DUPLICATE' })
      } else {
        allNames.push(name)
      }
    })
  })
  imports.forEach(node => { allPaths.push(getComponentPath(node)) })
  const uniquePaths = unique(allPaths)
  if (uniquePaths.length !== allPaths.length) {
    const duplicates = uniquePaths.filter(path => allPaths.includes(path))
    duplicates.forEach(duplicate => {
      warnings.push({ message: `Component path duplicate: ${duplicate}`, type: 'COMPONENT_PATH_DUPLICATE' })
    })
  }
  return warnings
}
const MAXIMUM_IMPORT_DEPTH = 50
async function recursiveImport (tree, path, options, depth) {
  if (depth > MAXIMUM_IMPORT_DEPTH) {
    return {
      components: [],
      warnings: [{ type: 'MAXIMUM_IMPORT_DEPTH_EXCEEDED', message: 'Maximum import depth exceeded' }]
    }
  }
  const imports = findImportNodes(tree)
  const warnings = validateImports(imports)
  const components = await Promise.all(imports.map(node => fetch(node, path, options)))
  const current = flatten(components)
  const nested = await Promise.all(current.filter(element => element.tree).map(async element => {
    return recursiveImport(element.tree, element.path, options, depth + 1)
  }))
  let nestedComponents = current.concat(flatten(nested.map(object => object.components)))
  nestedComponents = mergeComponents(nestedComponents)
  const nestedWarnings = warnings.concat(flatten(nested.map(object => object.warnings)))
  return {
    components: nestedComponents,
    warnings: nestedWarnings.concat(flatten(nestedComponents.map(file => file.warnings)))
  }
}

function mergeComponents (components) {
  const object = {}
  components.forEach(component => {
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
    this.tree = parse(source)
    this.options = options
  }
  async import () {
    return recursiveImport(this.tree, '.', this.options, 0)
  }
}
