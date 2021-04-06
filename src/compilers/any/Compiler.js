const JSCompiler = require('../js/Compiler')

class Compiler {
  constructor (options = {}) {
    this.options = options
  }

  async compile (input) {
    if (this.options.format === 'js') {
      const compiler = new JSCompiler(this.options)
      return compiler.compile(input)
    }
    const template = () => {
      return input
    }
    return { template }
  }
}

module.exports = Compiler
