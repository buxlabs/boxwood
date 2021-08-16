const { findAsset } = require('../utilities/asset')

module.exports = ({ paths }) => ({
  name: 'resolve',
  setup (build) {
    build.onResolve({ filter: /.*/ }, args => {
      // TODO handle libs from node_modules out of the box
      return findAsset(args.path, undefined, { paths })
    })
  }
})
