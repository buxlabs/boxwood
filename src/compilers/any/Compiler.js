const JSCompiler = require('../js/Compiler')
const { transpile } = require('../../transpilers/html')

class Compiler {
  constructor (options = {}) {
    this.options = options
  }

  async compile (input) {
    const source = this.options.format === 'js' || this.options.path?.endsWith('.js') ? input : transpile(input, this.options)
    const compiler = new JSCompiler(this.options)
    return compiler.compile(source)
  }
}

module.exports = Compiler
