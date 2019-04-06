const walk = require('himalaya-walk')
const fs = require('fs')
const { join } = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const { isImportTag } = require('./string')
const { flatten } = require('pure-utilities/collection')
const { getComponentNames } = require('./node')
const parse = require('./html/parse')

module.exports = class Importer {
  constructor (source, options = {}) {
    this.tree = parse(source)
    this.options = options
  }
  async import () {
    const imports = find(this.tree)
    const components = await Promise.all(imports.map(node => fetch(node, '.', this.options)))
    const list = flatten(components)
    let array = []
    await Promise.all(list.map(async element => {
      const imports = find(element.tree)
      const components = await Promise.all(imports.map(node => fetch(node, element.path, this.options)))
      array = array.concat(flatten(components))
    }))
    return list.concat(array)
  }
}

function find (tree) {
  const nodes = []
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      nodes.push(node)
    }
  })
  return nodes
}

async function read (path, paths = []) {
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
    const { source, path } = await read(getComponentPath(node, name), options.paths)
    const tree = parse(source)
    const files = [context]
    const warnings = []
    return { name, source, path, files, warnings, tree }
  }))
}

function getComponentPath (node, name) {
  const length = node.attributes.length
  let path = node.attributes[length - 1].value
  if (path.endsWith('.html')) {
    return path
  }
  return join(path, `${name}.html`)
}
