const { parse } = require('himalaya')
const defaults = require('./defaults')

module.exports = function (source, options) {
  return parse(source, defaults(source, options))
}
