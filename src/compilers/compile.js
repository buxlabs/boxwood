const JSCompiler = require('./js/Compiler')
const HTMLCompiler = require('./html/Compiler')
const AnyCompiler = require('./any/Compiler')
const { getExtension } = require('../utilities/string')

const compilers = {
  js: JSCompiler,
  html: HTMLCompiler,
  any: AnyCompiler
}

module.exports = async function compile (input, options) {
  const extension = getExtension(options.path) || 'html'
  const Compiler = options.compiler ? compilers[options.compiler] : compilers[extension] || compilers.html
  const compiler = new Compiler(options)
  return compiler.compile(input)
}
