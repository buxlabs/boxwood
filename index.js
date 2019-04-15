const Compiler = require('./src/Compiler')

module.exports = {
  async compile (source, options = {}) {
    const compiler = new Compiler(options)
    return compiler.compile(source)
  }
}
