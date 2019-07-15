const { join, dirname } = require('path')
let { readFile, readFileWithCache, resolveAlias } = require('./files')
const { flatten } = require('pure-utilities/collection')
const Linter = require('./Linter')
const request = require('./request')
const { getFullRemoteUrl, isRemotePath } = require('./url')

const { getComponentNames, getAssetPaths, getImportNodes } = require('./node')
const parse = require('./html/parse')
const linter = new Linter()

async function loadComponent (path, isRemote, remoteUrl, options, paths = []) {
  path = resolveAlias(path, options.aliases)
  if (isRemotePath(path) || isRemote) {
    try {
      const url = getFullRemoteUrl(remoteUrl, path)
      const response = await request.get(url, {
        responseType: 'arraybuffer',
        cache: options.cache
      })
      if (response.status === 200) {
        let buffer = Buffer.from(response.data, 'binary') // TODO: parse response to the buffer
        let base64 = buffer.toString('base64') // TODO: find a good way to change data to base64, like readFile
        return {
          path,
          source: buffer.toString(),
          buffer,
          base64,
          remote: true,
          url
        }
      }
    } catch (exception) {}
  } else {
    const read = options.cache ? readFileWithCache : readFile
    for (let option of paths) {
      try {
        const location = join(option, path)
        options.hooks.onBeforeFile(location)
        const file = {}
        file.path = location
        file.buffer = await read(location)
        file.base64 = await read(location, 'base64')
        // TODO: Read once convert base64
        file.source = await read(location, 'utf8')
        file.remote = false
        options.hooks.onAfterFile(file)
        return file
      } catch (exception) {}
    }
  }
  return {}
}

async function fetch (node, kind, context, isRemote, remoteUrl, options) {
  const paths = options.paths || []
  const names = kind === 'IMPORT' ? getComponentNames(node) : ['']
  return Promise.all(names.map(async name => {
    const type = kind === 'IMPORT' ? 'COMPONENT' : kind
    const dir = dirname(context)
    const assetPaths = getAssetPaths(node, name)
    return Promise.all(assetPaths.map(async assetPath => {
      const { source, path, base64, remote, url, buffer } = await loadComponent(assetPath, isRemote, remoteUrl, options, [dir, ...paths])
      if (!path) {
        return {
          warnings: [{ type: 'COMPONENT_NOT_FOUND', message: `Component not found: ${isRemotePath(assetPath) ? assetPath : name}` }]
        }
      }
      const tree = parse(source)
      const files = [context]
      const warnings = []
      return { name, source, base64, remote, url, buffer, path, files, warnings, tree, type }
    }))
  }))
}
const MAXIMUM_IMPORT_DEPTH = 50
async function recursiveImport (tree, source, path, options, depth, remote, url) {
  if (depth > MAXIMUM_IMPORT_DEPTH) {
    return {
      assets: [],
      warnings: [{
        type: 'MAXIMUM_IMPORT_DEPTH_EXCEEDED',
        message: 'Maximum import depth exceeded',
        severity: 'critical'
      }]
    }
  }
  const imports = getImportNodes(tree, options)
  const warnings = linter.lint(tree, source, imports.map(({ node }) => node), options)
  const assets = await Promise.all(imports.map(({ node, kind }) => fetch(node, kind, path, remote, url, options)))
  const current = flatten(assets)
  const nested = await Promise.all(current.filter(element => element.tree).map(async element => {
    return recursiveImport(element.tree, element.source, element.path, options, depth + 1, element.remote, element.url)
  }))
  let nestedAssets = current.concat(flatten(nested.map(object => object.assets)))
  nestedAssets = mergeAssets(nestedAssets)
  const nestedWarnings = warnings.concat(flatten(nested.map(object => object.warnings)))
  return {
    assets: nestedAssets,
    warnings: nestedWarnings.concat(
      flatten(nestedAssets.map(file => file.warnings)),
      flatten(current.map(element => element.warnings))
    )
  }
}

function mergeAssets (assets) {
  const object = {}
  assets.forEach(component => {
    const { path, files } = component
    if (!path) return
    if (!object[path]) {
      object[path] = component
    } else {
      component.files = [...object[path].files, ...files]
      object[path] = component
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
    return recursiveImport(this.tree, this.source, '.', this.options, 0, false, null)
  }
}
