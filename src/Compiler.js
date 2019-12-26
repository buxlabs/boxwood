const Parser = require('./Parser')
const Renderer = require('./Renderer')
const Analyzer = require('./Analyzer')
const Optimizer = require('./Optimizer')
const Transpiler = require('./Transpiler')
const { getOptions, validateOptions } = require('./utilities/options')

class Compiler {
  constructor (options) {
    this.options = getOptions(options)
    this.errors = validateOptions(this.options)
    this.options.hooks = Object.assign({
      onBeforeFile () {},
      onAfterFile () {}
    }, options.hooks)
  }

  transpile (source) {
    const transpiler = new Transpiler()
    return transpiler.transpile(source)
  }

  parse (source) {
    const parser = new Parser()
    return parser.parse(source)
  }

  async generate (source, htmltree) {
    const renderer = new Renderer()
    var { tree, statistics, warnings, errors } = await renderer.render(source, htmltree, this.options)
    const analyzer = new Analyzer(tree)
    const params = analyzer.params()
    const optimizer = new Optimizer(tree)
    optimizer.optimize()
    const compiled = new Function(`return function render(${params}) {\n${tree.source}}`)() // eslint-disable-line
    const allErrors = [
      ...errors,
      ...this.errors
    ].map(error => {
      const lines = error.stack.split('\n')
      const type = lines.shift().split(':')[0]
      const stack = lines.join('\n').trim()
      return {
        type,
        message: error.message,
        stack
      }
    })
    return { template: compiled, statistics: statistics.serialize(), errors: allErrors, warnings }
  }

  async compile (input) {
    const source = this.transpile(input)
    const tree = this.parse(source)
    return this.generate(source, tree)
  }
}

module.exports = Compiler
