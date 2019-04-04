const walk = require('himalaya-walk')
const fs = require('fs')
const { join } = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
module.exports = class Importer {
  // TODO: pass source
  constructor (tree, options = {}) {
    this.tree = tree
    this.options = options
  }
  async import () {
    const nodes = find(this.tree)
    const promises = Promise.all(nodes.map(async node => {
      // TODO: Move to fetch
      const { source, path } = await read(getComponentPath(node), this.options.paths)
      const name = getComponentName(node)
      const files = ['.']
      const warnings = []
      return { name, source, path, files, warnings }
    }))
    return promises
  }
}

function find (tree) {
  const nodes = []
  walk(tree, (node) => {
    // TODO: Create a method
    if (node.tagName === 'import' || node.tagName === 'require') {
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

function getComponentName (node) {
  return node.attributes[0].key
}

function getComponentPath (node) {
  const length = node.attributes.length
  return node.attributes[length - 1].value
}
