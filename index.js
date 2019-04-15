const Compiler = require('./src/Compiler')
module.exports = {
  async compile (source, options = {}) {
    var compiler = new Compiler(options)
    var template = compiler.parse(source)
    var warnings = compiler.lint(template, source)
    warnings.forEach(warning => console.warn(warning))
    var { tree, statistics, errors } = await compiler.transform(template)
    return compiler.generate({ tree, statistics, errors })
  }
}
