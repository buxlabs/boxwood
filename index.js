const Compiler = require('./src/Compiler')

module.exports = {
  compile (source, options = {}) {
    const compiler = new Compiler(options)
    const trees = compiler.transform(compiler.parse(source))
    return compiler.generate(trees)
  }
}
