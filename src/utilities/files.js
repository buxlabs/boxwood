'use strict'

const { join } = require('path')
const { getFullRemoteUrl, isRemotePath } = require('./url')
const fs = require('fs')
const util = require('util')
const memoize = require('memoizee')
const readFile = util.promisify(fs.readFile)
const readFileWithCache = memoize(readFile)
const { isImage } = require('pure-conditions')

const SUPPORTED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']

function resolveAlias (path, aliases = []) {
  for (const alias of aliases) {
    const { from, to } = alias
    if (path.match(from)) {
      return path.replace(from, to)
    }
  }
  return path
}

function isFileSupported (path) {
  return isImage(path) || SUPPORTED_EXTENSIONS.map(extension => path.endsWith(extension)).includes(true)
}

// TODO: Unify with Importer
function findAsset (path, assets, options) {
  path = resolveAlias(path, options.aliases)
  if (isRemotePath(path)) {
    const asset = assets.find(asset => asset.path === path)
    if (asset) return asset
  } else {
    for (const location of options.paths) {
      let asset = null
      if (isRemotePath(location)) {
        const searchPath = getFullRemoteUrl(location, path)
        asset = assets.find(asset => asset.url === searchPath)
      } else {
        const searchPath = join(location, path)
        asset = assets.find(asset => asset.path === searchPath)
      }
      if (asset) return asset
    }
  }
}

module.exports = {
  findAsset,
  isFileSupported,
  readFile,
  readFileWithCache,
  resolveAlias
}
