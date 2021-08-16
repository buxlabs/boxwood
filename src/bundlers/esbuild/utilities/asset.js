const { existsSync } = require('fs')
const { join } = require('path')

function findAsset (filepath, extension = 'js', { paths }) {
  for (let i = 0, ilen = paths.length; i < ilen; i += 1) {
    const path = join(paths[i], filepath.endsWith(`.${extension}`) ? filepath : `${filepath}.${extension}`)
    const index = join(paths[i], filepath, `index.${extension}`)
    if (existsSync(path)) {
      return { path }
    } else if (existsSync(index)) {
      return { path: index }
    }
  }
}

module.exports = { findAsset }
