const Compiler = require('./Compiler')

module.exports = async function compile (source, options = {}) {
  const compiler = new Compiler(options)
  return compiler.compile(source)
}
