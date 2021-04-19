const Plugin = require('../Plugin')
const { parseData, getDataFormat } = require('../../utilities/data')
const { isPlainObject } = require('pure-conditions')
const { optimizeNode } = require('../../utilities/optimize')
const { createTranslationError } = require('../../utilities/errors')
const CODE_TAGS = ['style', 'script']

class DataPlugin extends Plugin {
  beforeprerun () {
    this.variables = []
  }

  prerun ({ tag, fragment, keys, errors, stack, pass }) {
    if (pass !== 'renderer') return null
    // TODO right data must be defined above usage
    // consider changing interface of plugins
    // to allow having 2 passes of walk instead of just one
    // it could be declarative, e.g. new Plugin({ passes: 2 })
    if (tag === 'data') {
      if (keys.length > 0) {
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
      } else {
        errors.push(createTranslationError('Data tag must specify a format (js, json or yaml).', stack))
      }
    }

    if (CODE_TAGS.includes(tag)) {
      fragment.children.forEach(node => {
        node.skipDataOptimization = true
      })
    }

    if (this.variables.length > 0 && !fragment.skipDataOptimization) {
      optimizeNode(fragment, this.variables, [], true)
    }
  }

  afterrun () {
    this.variables = []
  }
}

module.exports = DataPlugin
