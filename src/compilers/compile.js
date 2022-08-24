const JSCompiler = require('./js/Compiler')
const { transpile: transpileHTML } = require('../transpilers/html')

module.exports = async function compile (input, options) {
  const source = options.format === 'js' || options.path?.endsWith('.js') ? input : transpileHTML(input, options)
  const compiler = new JSCompiler(options)
  return compiler.compile(source)
}
