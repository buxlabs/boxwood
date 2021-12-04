const { camelize } = require('pure-utilities/string')

function pathToIdentifier (path) {
  return `__${camelize(path.replace(/\./g, 'Dot_').replace(/\//g, 'Slash_'))}__`
}

module.exports = {
  pathToIdentifier
}
