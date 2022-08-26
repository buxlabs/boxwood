const { findAsset } = require('../utilities/asset')

module.exports = ({ paths }) => ({
  name: 'resolve',
  setup (build) {
    build.onResolve({ filter: /.*/ }, args => {
      return findAsset(args.path, undefined, { paths })
    })
  }
})
