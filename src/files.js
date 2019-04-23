const { join } = require('path')

const SUPPORTED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']
function isFileSupported (path) {
  return SUPPORTED_EXTENSIONS
    .map(extension => path.endsWith(extension)).includes(true)
}

// TODO: Unify with Importer
function findAsset (path, assets, options) {
  for (let location of options.paths) {
    const asset = assets.find(asset => asset.path === join(location, path))
    if (asset) return asset
  }
}

module.exports = {
  findAsset,
  isFileSupported
}
