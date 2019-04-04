const walk = require('himalaya-walk')
const fs = require('fs')
const { join } = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const { isImportTag } = require('./string')
module.exports = class Importer {
  constructor (tree, source, options = {}) {
    this.tree = tree
    this.source = source
    this.options = options
  }
  async import () {
    const nodes = find(this.tree)
    const promises = Promise.all(nodes.map(fetch.bind(this)))
    return promises
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

async function fetch (node) {
  const { source, path } = await read(getComponentPath(node), this.options.paths)
  const name = getComponentName(node)
  const files = ['.']
  const warnings = []
  return { name, source, path, files, warnings }
}

function getComponentName (node) {
  return node.attributes[0].key
}

function getComponentPath (node) {
  const length = node.attributes.length
  return node.attributes[length - 1].value
}
