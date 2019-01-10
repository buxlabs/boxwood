const { existsSync } = require('fs')
const { join } = require('path')

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

module.exports = {
  findFile
}
