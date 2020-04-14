'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./utilities/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement, getTemplateAssignmentExpression } = require('./utilities/factory')
const collect = require('./utilities/collect')
const { getFilter } = require('./utilities/filters')
const { unique } = require('pure-utilities/array')
const Statistics = require('./Statistics')
const DataPlugin = require('./plugins/DataPlugin')
const CurlyStylesPlugin = require('./plugins/CurlyStylesPlugin')
const ScopedStylesPlugin = require('./plugins/ScopedStylesPlugin')
const InternationalizationPlugin = require('./plugins/InternationalizationPlugin')
const BoxModelPlugin = require('./plugins/BoxModelPlugin')
const InlinePlugin = require('./plugins/InlinePlugin')
const SwappedStylesPlugin = require('./plugins/SwappedStylesPlugin')
const Importer = require('./Importer')
const Optimizer = require('./Optimizer')
const Scope = require('./Scope')
const { getLiteral } = require('./utilities/ast')

class Renderer {
  async render (source, htmltree, options) {
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
      new DataPlugin(),
      new InlinePlugin(),
      new BoxModelPlugin(options),
      new CurlyStylesPlugin(),
      new ScopedStylesPlugin(),
      new SwappedStylesPlugin(),
      new InternationalizationPlugin({ translations, filters })
    ]
    const depth = 0
    tree.append(getTemplateVariableDeclaration(TEMPLATE_VARIABLE))
    plugins.forEach(plugin => {
      plugin.depth = 0
      plugin.beforeprerun()
    })
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
            ...fragment,
            pass: 'renderer'
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
        tree.append(getTemplateAssignmentExpression(TEMPLATE_VARIABLE, getLiteral(`<style>${style}</style>`)))
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
    const scope = new Scope()
    scope.flatten(tree)
    const optimizer = new Optimizer()
    optimizer.optimize(tree)
    return { tree, statistics, warnings, errors }
  }
}

module.exports = Renderer
