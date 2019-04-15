const Compiler = require('./src/Compiler')
module.exports = {
  async compile (source, options = {}) {
    var compiler = new Compiler(options)
    var tree = compiler.parse(source)
    var warnings = compiler.lint(tree, source)
    warnings.forEach(warning => console.warn(warning))
    return compiler.generate(source, tree)
  }
}
