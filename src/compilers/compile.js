const JSCompiler = require('./js/Compiler')
const HTMLCompiler = require('./html/Compiler')
const { getExtension } = require('../utilities/string')

const compilers = {
  js: JSCompiler,
  html: HTMLCompiler
}

module.exports = async function compile (input, options) {
  const extension = getExtension(options.path) || 'html'
  const Compiler = compilers[extension] || compilers.html
  const compiler = new Compiler(options)
  return compiler.compile(input)
}
