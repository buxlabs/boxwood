const { stringify } = require('himalaya')
const defaults = require('./defaults')

module.exports = function (source, options) {
  return stringify(source, defaults(source, options))
}
