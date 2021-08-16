const YAML = require('yaml')
const { findAsset } = require('../utilities/asset')
const { promises: { readFile } } = require('fs')

module.exports = ({ paths }) => ({
  name: 'yaml',
  setup (build) {
    build.onResolve({ filter: /\.yaml?$/ }, args => ({
      path: args.path.replace(/\.yaml$/, ''),
      namespace: 'boxwood-yaml'
    }))
    build.onLoad({
      filter: /.*/,
      namespace: 'boxwood-yaml'
    }, async (args) => {
      const asset = findAsset(args.path, 'yaml', { paths })
      if (!asset) {
        // throw with a nice error message and add specs
      }
      const content = await readFile(asset.path, 'utf8')
      const data = YAML.parse(content)
      return {
        contents: `
          const data = ${JSON.stringify(data)}

          export function i18n (language) {
            return function (key) {
              return data.i18n[key][language]
            }
          }

          export default data
        `,
        loader: 'js'
      }
    })
  }
})
