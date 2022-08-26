const { promises: { readFile } } = require('fs')
const { findAsset } = require('../../utilities/asset')
const { transpile: transpileCSS, getSelectors } = require('./transpilers/css')

module.exports = ({ paths, styles }) => ({
  name: 'module.css',
  setup (build) {
    build.onResolve({ filter: /\.module\.css/ }, args => ({
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
      const style = transpileCSS(content)
      const selectors = getSelectors(style)
      styles.push(style)
      return {
        contents: `export default ${JSON.stringify(selectors)}`,
        loader: 'js'
      }
    })
  }
})
