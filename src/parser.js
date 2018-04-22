const { parse } = require('himalaya')
const walk = require('./walk')

module.exports = {
  parse (source) {
    return parse(source)
  },
  walk (tree, callback) {
    walk(tree, callback)
  }
}
