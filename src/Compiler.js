'use strict'

const Transpiler = require('./Transpiler')
const Parser = require('./Parser')
const Renderer = require('./Renderer')
const Generator = require('./Generator')
const Cache = require('./Cache')
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
  const generator = new Generator()
  const { template, dynamic } = generator.generate(tree)
  return {
    template,
    statistics: statistics.serialize(),
    errors: errors.concat(validateOptions(options)).map(normalizeErrors),
    warnings,
    dynamic
  }
}

const cache = new Cache()

class Compiler {
  constructor (options) {
    this.options = getOptions(options)
  }

  async compile (input) {
    if (this.options.cache === true && cache.has(input)) { return { ...cache.get(input), from: 'cache' } }
    const source = transpile(input)
    const tree = parse(source)
    const output = await generate(source, tree, this.options)
    if (output.dynamic === false) {
      output.html = output.template()
    }
    if (this.options.cache === true) {
      cache.set(input, output)
    }
    return { ...output, from: 'generator' }
  }
}

module.exports = Compiler
