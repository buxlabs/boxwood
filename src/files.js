const { join } = require('path')
const { getFullRemoteUrl, isRemotePath } = require('./url')
const fs = require('fs')
const util = require('util')
const memoize = require('memoizee')
const readFile = util.promisify(fs.readFile)
const readFileWithCache = memoize(readFile)

const SUPPORTED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']
function isFileSupported (path) {
  return SUPPORTED_EXTENSIONS
    .map(extension => path.endsWith(extension)).includes(true)
}

// TODO: Unify with Importer
function findAsset (path, assets, options) {
  if (isRemotePath(path)) {
    const asset = assets.find(asset => asset.path === path)
    if (asset) return asset
  } else {
    for (let location of options.paths) {
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
  readFileWithCache
}
