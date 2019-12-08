const Parser = require('./Parser')
const Renderer = require('./Renderer')
const Analyzer = require('./Analyzer')
const Optimizer = require('./Optimizer')
const { validateOptions } = require('./validation')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./enum')

class Compiler {
  constructor (options) {
    this.options = Object.assign({
      inline: [],
      compilers: {},
      paths: [],
      languages: [],
      cache: true,
      variables: {
        template: TEMPLATE_VARIABLE,
        object: OBJECT_VARIABLE,
        escape: ESCAPE_VARIABLE
      },
      aliases: [],
      styles: {
        spacing: {
          small: '5px',
          medium: '15px',
          large: '60px'
        }
      },
      script: {
        paths: []
      }
    }, options)
    this.errors = validateOptions(this.options)
    this.options.hooks = Object.assign({
      onBeforeFile () {},
      onAfterFile () {}
    }, options.hooks)
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
    if (process.env.DEBUG && process.env.DEBUG.includes('pure-engine')) {
      console.log(tree.source)
    }
    const compiled = new Function(`return function render(${params}) {\n${tree.source}}`)() // eslint-disable-line
    if (process.env.DEBUG && process.env.DEBUG.includes('pure-engine')) {
      console.log(compiled.toString())
    }
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

  async compile (source) {
    const tree = this.parse(source)
    return this.generate(source, tree)
  }
}

module.exports = Compiler
