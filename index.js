const Compiler = require('./src/Compiler')

module.exports = {
  async compile (source, options = {}) {
    const compiler = new Compiler(options)
    const tree = compiler.parse(source)
    const [template, rescue] = await compiler.transform(tree)
    return compiler.generate({ template, rescue })
  }
}
