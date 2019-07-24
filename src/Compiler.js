const AbstractSyntaxTree = require('abstract-syntax-tree')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement, getTemplateAssignmentExpression } = require('./factory')
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
const SwappedStylesPlugin = require('./plugins/SwappedStylesPlugin')
const Importer = require('./Importer')
const { validateOptions } = require('./validation')
const { getLiteral } = require('./ast')

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
    } else if (asset.type === 'TRANSLATION') {
      statistics.translations.push(asset)
    }
  })
  const styles = []
  const store = {}
  const translations = {}
  const promises = []
  const errors = []
  const plugins = [
    new InlinePlugin(),
    new BoxModelPlugin(options),
    new CurlyStylesPlugin(),
    new ScopedStylesPlugin(),
    new SwappedStylesPlugin(),
    new InternationalizationPlugin({ translations, filters })
  ]
  let depth = 0
  tree.append(getTemplateVariableDeclaration(TEMPLATE_VARIABLE))
  plugins.forEach(plugin => { plugin.beforeprerun() })
  walk(htmltree, async fragment => {
    try {
      const attrs = fragment.attributes || []
      plugins.forEach(plugin => {
        plugin.prerun({
          source,
          tag: fragment.tagName,
          keys: attrs.map(attribute => attribute.key),
          attrs,
          fragment,
          options,
          assets,
          ...fragment
        })
      })
    } catch (exception) {
      errors.push(exception)
    }
  })
  plugins.forEach(plugin => { plugin.afterprerun() })

  const severities = warnings.map(warning => warning.severity)
  if (!severities.includes('critical')) {
    walk(htmltree, async fragment => {
      await collect({ source, tree, fragment, assets, variables, filters, components, styles, translations, plugins, store, depth, options, promises, errors, warnings })
    })
    await Promise.all(promises)
    const style = unique(styles).join(' ')
    if (style) {
      tree.append(getTemplateAssignmentExpression(OBJECT_VARIABLE, getLiteral(`<style>${style}</style>`)))
    }
    const used = []
    unique(filters).forEach(name => {
      const filter = getFilter(name, translations, options)
      if (filter && !used.includes(filter.id.name)) {
        tree.prepend(filter)
        used.push(filter.id.name)
      }
    })
  }
  tree.append(getTemplateReturnStatement())
  return { tree, statistics, warnings, errors }
}

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
    var { tree, statistics, warnings, errors } = await render(source, htmltree, this.options)
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
