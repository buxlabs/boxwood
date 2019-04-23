const { join } = require('path')

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
      const asset = assets.find(asset => asset.path === join(location, path))
      if (asset) return asset
    }
  }
}

function isRemotePath (path) {
  return path.startsWith('http://') || path.startsWith('https://')
}

module.exports = {
  findAsset,
  isFileSupported,
  isRemotePath
}
