const { findAsset } = require('../utilities/files')

module.exports = function link ({ attrs, assets, options, styles }) {
  const { value: path } = attrs.find(attr => attr.key === 'href')
  const asset = findAsset(path, assets, options)
  if (!asset) return
  styles.push(asset.source.trim())
}
