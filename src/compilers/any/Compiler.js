const JSCompiler = require('../js/Compiler')
const { transpile } = require('../../transpilers/html')

class Compiler {
  constructor (options = {}) {
    this.options = options
  }

  async compile (input) {
    const source = this.options.format === 'js' ? input : transpile(input)
    const compiler = new JSCompiler(this.options)
    return compiler.compile(source)
  }
}

module.exports = Compiler
