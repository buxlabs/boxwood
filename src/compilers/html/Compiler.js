'use strict'

const Transpiler = require('./Transpiler')
const Parser = require('./Parser')
const Renderer = require('./Renderer')
const Generator = require('./Generator')
const { validateOptions } = require('../../utilities/options')
const { normalizeError } = require('../../utilities/errors')

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
    errors: errors.concat(validateOptions(options)).map(normalizeError),
    warnings,
    dynamic
  }
}

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const { options } = this
    const source = transpile(input)
    const tree = parse(source)
    return generate(source, tree, options)
  }
}

module.exports = Compiler
