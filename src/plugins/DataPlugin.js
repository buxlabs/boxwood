const Plugin = require('./Plugin')
const { parseData, getDataFormat } = require('../utilities/data')
const { isPlainObject } = require('pure-conditions')
const { optimizeNode } = require('../utilities/optimize')

class DataPlugin extends Plugin {
  beforeprerun () {
    this.variables = []
  }

  prerun ({ tag, fragment, keys, pass }) {
    if (pass !== 'renderer') return null
    // TODO right data must be defined above usage
    // consider changing interface of plugins
    // to allow having 2 passes of walk instead of just one
    // it could be declarative, e.g. new Plugin({ passes: 2 })
    if (tag === 'data') {
      const format = getDataFormat(keys)
      const { content } = fragment.children[0]
      const data = parseData(format, content)
      if (isPlainObject(data)) {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key]
            this.variables.push({ key, value })
          }
        }
      }
    }
    if (this.variables.length > 0) {
      optimizeNode(fragment, this.variables, [], true)
    }
  }

  afterrun () {
    this.variables = []
  }
}

module.exports = DataPlugin
