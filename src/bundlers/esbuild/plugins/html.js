const { promises: { readFile } } = require('fs')
const { findAsset } = require('../utilities/asset')

module.exports = ({ paths }) => ({
  name: 'html',
  setup (build) {
    build.onResolve({ filter: /\.html?$/ }, args => ({
      path: args.path.replace(/\.html$/, ''),
      namespace: 'boxwood-html'
    }))
    build.onLoad({
      filter: /.*/,
      namespace: 'boxwood-html'
    }, async (args) => {
      const asset = findAsset(args.path, 'html', { paths })
      if (!asset) {
        // throw with a nice error message and add specs
      }
      const content = await readFile(asset.path, 'utf8')
      return {
        contents: content.trim(),
        loader: 'js'
      }
    })
  }
})
