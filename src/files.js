const { existsSync } = require('fs')
const { join } = require('path')

const SUPPORTED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']
function isFileSupported (path) {
  return SUPPORTED_EXTENSIONS
    .map(extension => path.endsWith(extension)).includes(true)
}

function findFile (path, options, callback) {
  if (!options.paths) { throw new Error('Compiler option is undefined: paths.') }
  let found = false
  for (let i = 0, ilen = options.paths.length; i < ilen; i += 1) {
    const location = join(options.paths[i], path)
    if (!existsSync(location)) continue
    callback(location)
    found = true
    break
  }
  if (!found) { throw new Error(`Asset not found: ${path}.`) }
}

// TODO: Unify with Importer
function findAsset (path, assets, options) {
  for (let location of options.paths) {
    const asset = assets.find(asset => asset.path === join(location, path))
    if (asset) return asset
  }
}

module.exports = {
  findFile,
  findAsset,
  isFileSupported
}
