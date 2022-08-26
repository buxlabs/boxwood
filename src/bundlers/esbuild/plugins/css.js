const { promises: { readFile } } = require('fs')
const { findAsset } = require('../utilities/asset')

module.exports = ({ paths }) => ({
  name: 'css',
  setup (build) {
    build.onResolve({ filter: /\.css/ }, args => ({
      path: args.path,
      namespace: 'boxwood-css'
    }))
    build.onLoad({
      filter: /.*/,
      namespace: 'boxwood-css'
    }, async (args) => {
      const asset = findAsset(args.path, 'css', { paths })
      if (!asset) {
        // throw with a nice error message and add specs
      }
      const content = await readFile(asset.path, 'utf8')
      return {
        contents: `export default \`${content}\``,
        loader: 'js'
      }
    })
  }
})
