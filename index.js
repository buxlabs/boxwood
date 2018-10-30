const Compiler = require('./src/Compiler')

module.exports = {
  compile (source, options = {}) {
    const compiler = new Compiler(options)
    let tree = compiler.parse(source)
    return compiler.transform(tree)
      .then(tree => {
        return compiler.generate(tree)
      })
  }
}
