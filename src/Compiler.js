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
  const { template } = generator.generate(tree)
  return {
    template,
    statistics: statistics.serialize(),
    errors: errors.concat(validateOptions(options)).map(normalizeErrors),
    warnings
  }
}

class Compiler {
  constructor (options) {
    this.options = getOptions(options)
    this.cache = new Cache()
  }

  async compile (input) {
    if (this.options.cache && this.cache.has(input)) { return this.cache.get(input) }
    const source = transpile(input)
    const tree = parse(source)
    const output = generate(source, tree, this.options)
    this.options.cache && this.cache.set(input, output)
    return output
  }
}

module.exports = Compiler
