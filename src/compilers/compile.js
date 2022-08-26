const JSCompiler = require('./js/Compiler')

module.exports = async function compile (source, options) {
  const compiler = new JSCompiler(options)
  return compiler.compile(source)
}
