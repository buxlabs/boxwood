const Compiler = require('./src/Compiler')
const escape = require('./src/vdom/utilities/escape')

module.exports = {
  async compile (source, options = {}) {
    const compiler = new Compiler(options)
    return compiler.compile(source)
  },
  escape
}
