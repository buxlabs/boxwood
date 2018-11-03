const Compiler = require('./src/Compiler')

module.exports = {
  async compile (source, options = {}) {
    const compiler = new Compiler(options)
    let tree = compiler.parse(source)
    return compiler.transform(tree)
      .then(promises => {
        return compiler.generate({ template: promises[0], rescue: promises[1] })
      })
  }
}
