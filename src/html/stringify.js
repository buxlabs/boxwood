const { stringify } = require('himalaya')
const defaults = require('./defaults')

// TODO: Clean up to receive two parameters.
module.exports = function (tree, source, options) {
  return stringify(tree, defaults(source, options))
}
