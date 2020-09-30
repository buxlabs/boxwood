'use strict'

const Cache = require('./Cache')
const { getOptions } = require('./utilities/options')
const compile = require('./compilers/compile')

const cache = new Cache()

class Compiler {
  constructor (options) {
    this.options = getOptions(options)
  }

  async compile (input) {
    const { options } = this
    if (options.cache === true && cache.has(input)) { return { ...cache.get(input), from: 'cache' } }
    const output = await compile(input, options)
    if (output.dynamic === false) {
      output.html = output.template()
    }
    if (options.cache === true) {
      cache.set(input, output)
    }
    return { ...output, from: 'generator' }
  }
}

module.exports = Compiler
