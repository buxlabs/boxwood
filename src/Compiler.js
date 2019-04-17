const AbstractSyntaxTree = require('abstract-syntax-tree')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./factory')
const collect = require('./collect')
const { getFilter } = require('./filters')
const { unique } = require('pure-utilities/array')
const Parser = require('./Parser')
const Analyzer = require('./Analyzer')
const Optimizer = require('./Optimizer')
const Statistics = require('./Statistics')
const CurlyStylesPlugin = require('./plugins/CurlyStylesPlugin')
const ScopedStylesPlugin = require('./plugins/ScopedStylesPlugin')
const InternationalizationPlugin = require('./plugins/InternationalizationPlugin')
const BoxModelPlugin = require('./plugins/BoxModelPlugin')
const InlinePlugin = require('./plugins/InlinePlugin')
const Importer = require('./Importer')

async function render (source, htmltree, options) {
  if (!htmltree) { return null }
  const tree = new AbstractSyntaxTree('')
  const variables = [
    TEMPLATE_VARIABLE,
    OBJECT_VARIABLE,
    ESCAPE_VARIABLE
  ].concat(GLOBAL_VARIABLES)
  const filters = []
  const components = []
  const statistics = new Statistics()
  const importer = new Importer(source, options)
  const { assets, warnings } = await importer.import()
  assets.forEach(asset => {
    if (asset.type === 'COMPONENT') {
      statistics.components.push(asset)
    } else if (asset.type === 'PARTIAL') {
      statistics.partials.push(asset)
    } else if (asset.type === 'SCRIPT') {
      statistics.scripts.push(asset)
    } else if (asset.type === 'STYLESHEET') {
      statistics.stylesheets.push(asset)
    } else if (asset.type === 'SVG') {
      statistics.svgs.push(asset)
    } else if (asset.type === 'IMAGE') {
      statistics.images.push(asset)
    }
  })
  const store = {}
  const translations = {}
  const promises = []
  const errors = []
  const plugins = [
    new InlinePlugin(),
    new BoxModelPlugin(options),
    new CurlyStylesPlugin(),
    new ScopedStylesPlugin(),
    new InternationalizationPlugin({ translations, statistics, filters })
  ]
  let depth = 0
  tree.append(getTemplateVariableDeclaration(TEMPLATE_VARIABLE))
  plugins.forEach(plugin => { plugin.beforeprerun() })
  walk(htmltree, async fragment => {
    try {
      const attrs = fragment.attributes || []
      plugins.forEach(plugin => {
        plugin.prerun({
          tag: fragment.tagName,
          keys: attrs.map(attribute => attribute.key),
          attrs,
          fragment,
          options,
          ...fragment
        })
      })
    } catch (exception) {
      errors.push(exception)
    }
  })
  plugins.forEach(plugin => { plugin.afterprerun() })

  walk(htmltree, async fragment => {
    await collect({ tree, fragment, variables, filters, components, translations, plugins, store, depth, options, promises, errors })
  })
  await Promise.all(promises)
  const used = []
  unique(filters).forEach(name => {
    const filter = getFilter(name, translations, options)
    if (filter && !used.includes(filter.id.name)) {
      tree.prepend(filter)
      used.push(filter.id.name)
    }
  })
  tree.append(getTemplateReturnStatement())
  return { tree, statistics, warnings, errors }
}

class Compiler {
  constructor (options) {
    this.options = Object.assign({
      inline: [],
      compilers: {},
      variables: {
        template: TEMPLATE_VARIABLE,
        object: OBJECT_VARIABLE,
        escape: ESCAPE_VARIABLE
      }
    }, options)
  }
  parse (source) {
    const parser = new Parser()
    return parser.parse(source)
  }
  async generate (source, htmltree) {
    var { tree, statistics, warnings, errors } = await render(source, htmltree, this.options)
    const analyzer = new Analyzer(tree)
    const params = analyzer.params()
    const optimizer = new Optimizer(tree)
    optimizer.optimize()
    if (process.env.DEBUG) {
      console.log(tree.source)
    }
    warnings.forEach(warning => console.error(warning))
    const compiled = new Function(`return function render(${params}) {\n${tree.source}}`)() // eslint-disable-line
    return { template: compiled, statistics: statistics.serialize(), errors }
  }
  async compile (source) {
    const tree = this.parse(source)
    return this.generate(source, tree)
  }
}

module.exports = Compiler
