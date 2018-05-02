const { parse } = require('himalaya')
const walk = require('himalaya-walk')

module.exports = {
  parse (source) {
    return parse(source)
  },
  walk (tree, callback) {
    walk(tree, callback)
  }
}
