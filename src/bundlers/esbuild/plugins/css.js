const { promises: { readFile } } = require('fs')
const { findAsset } = require('../utilities/asset')
const { transpile: transpileCSS, getSelectors } = require('../../../transpilers/css')

module.exports = ({ paths, styles }) => ({
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
      const hasParams = args.path.includes('?')
      const isScoped = hasParams && args.path.includes('scoped=true')
      const path = hasParams ? args.path.substring(0, args.path.indexOf('?')) : args.path
      const asset = findAsset(path, 'css', { paths })
      if (!asset) {
        // throw with a nice error message and add specs
      }
      const content = await readFile(asset.path, 'utf8')
      if (isScoped) {
        const style = transpileCSS(content)
        const selectors = getSelectors(style)
        styles.push(style)
        return {
          contents: `export default ${JSON.stringify(selectors)}`,
          loader: 'js'
        }
      } else {
        return {
          contents: `export default \`${content}\``,
          loader: 'js'
        }
      }
    })
  }
})
