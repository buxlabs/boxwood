const Parser = require('./Parser')
const Renderer = require('./Renderer')
const Analyzer = require('./Analyzer')
const Transpiler = require('./Transpiler')
const { getOptions, validateOptions } = require('./utilities/options')
const { normalizeErrors } = require('./utilities/errors')

const transpile = (source) => {
  const transpiler = new Transpiler()
  return transpiler.transpile(source)
}

const parse = (source) => {
  const parser = new Parser()
  return parser.parse(source)
}

const generate = async (source, html, options) => {
    const renderer = new Renderer()
    const { tree, statistics, warnings, errors } = await renderer.render(source, html, options)
    const analyzer = new Analyzer()
    const { params } = analyzer.analyze(tree)
    const template = new Function(`return function render(${params}) {\n${tree.source}}`)() // eslint-disable-line
    const allErrors = [
      ...errors,
      ...validateOptions(options)
    ].map(normalizeErrors)
    return { template, statistics: statistics.serialize(), errors: allErrors, warnings }
}

class Compiler {
  constructor (options) {
    this.options = getOptions(options)
  }

  async compile (input) {
    const source = transpile(input)
    const tree = parse(source)
    return generate(source, tree, this.options)
  }
}

module.exports = Compiler
