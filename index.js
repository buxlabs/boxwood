const Compiler = require('./src/Compiler')

module.exports = {
  async compile (source, options = {}) {
    const compiler = new Compiler(options)
    let tree = compiler.parse(source)
    const promises = await compiler.transform(tree)
    return compiler.generate({ template: promises[0], rescue: promises[1] })
  }
}
