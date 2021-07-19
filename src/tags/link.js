const { minify } = require('csso')
const { findAsset } = require('../utilities/files')

module.exports = function link ({ attrs, assets, options, styles }) {
  const { value: path } = attrs.find(attr => attr.key === 'href')
  const asset = findAsset(path, assets, options)
  if (!asset) return
  if (attrs.find(attr => attr.key === 'minify')) {
    const { css } = minify(asset.source)
    styles.push(css)
  } else {
    styles.push(asset.source.trim())
  }
}
