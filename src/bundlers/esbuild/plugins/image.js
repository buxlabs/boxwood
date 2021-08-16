const { promises: { readFile } } = require('fs')
const { findAsset } = require('../utilities/asset')
const { getExtension, getBase64Extension } = require('../../../utilities/string')

function getBase64String (base64, path) {
  const extension = getExtension(path)
  return [
    `data:image/${getBase64Extension(extension)}`,
    'charset=utf-8',
    `base64,${base64}`
  ].join(';')
}

module.exports = ({ paths }) => ({
  name: 'png',
  setup (build) {
    build.onResolve({ filter: /\.png?$/ }, args => ({
      path: args.path.replace(/\.png$/, ''),
      namespace: 'boxwood-png'
    }))
    build.onLoad({
      filter: /.*/,
      namespace: 'boxwood-png'
    }, async (args) => {
      // TODO add other extensions
      const asset = findAsset(args.path, 'png', { paths })
      if (!asset) {
        // TODO throw with a nice error message and add specs
      }

      const buffer = await readFile(asset.path)
      const base64 = buffer.toString('base64')
      return {
        contents: `export default "${getBase64String(base64, asset.path)}"`,
        loader: 'js'
      }
    })
  }
})
