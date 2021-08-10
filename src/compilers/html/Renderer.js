'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, BUILT_IN_VARIABLES } = require('../../utilities/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement, getTemplateAssignmentExpression } = require('../../utilities/factory')
const collect = require('../../utilities/collect')
const { getFilter } = require('../../utilities/filters')
const { concatenateScripts } = require('../../utilities/js')
const { unique } = require('pure-utilities/array')
const Statistics = require('../../Statistics')
const RoutesPlugin = require('../../plugins/RoutesPlugin')
const DataPlugin = require('../../plugins/DataPlugin')
const CurlyStylesPlugin = require('../../plugins/CurlyStylesPlugin')
const ScopedStylesPlugin = require('../../plugins/ScopedStylesPlugin')
const InternationalizationPlugin = require('../../plugins/InternationalizationPlugin')
const BoxModelPlugin = require('../../plugins/BoxModelPlugin')
const InlinePlugin = require('../../plugins/InlinePlugin')
const SwappedStylesPlugin = require('../../plugins/SwappedStylesPlugin')
const Importer = require('../../Importer')
const Optimizer = require('../../Optimizer')
const Scope = require('../../Scope')
const { getLiteral } = require('../../utilities/ast')
const Preprocessor = require('./Preprocessor')
const { transpile: transpileCSS } = require('../../transpilers/css')

class Renderer {
  async render (source, htmltree, options) {
    if (!htmltree) { return null }
    const tree = new AbstractSyntaxTree('')
    const variables = [
      TEMPLATE_VARIABLE,
      OBJECT_VARIABLE,
      ESCAPE_VARIABLE
    ].concat(BUILT_IN_VARIABLES)
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
    const scripts = []
    const stack = [options.path]
    const store = {}
    const translations = {}
    const needles = {}
    const promises = []
    const errors = []
    const plugins = [
      new RoutesPlugin(options, errors),
      new DataPlugin(),
      new InlinePlugin(),
      new BoxModelPlugin(options),
      new CurlyStylesPlugin(),
      new ScopedStylesPlugin(),
      new SwappedStylesPlugin(),
      new InternationalizationPlugin({ translations, filters, errors })
    ]
    const depth = 0
    tree.append(getTemplateVariableDeclaration(TEMPLATE_VARIABLE))
    plugins.forEach(plugin => {
      plugin.depth = 0
      plugin.beforeprerun()
    })
    const preprocessor = new Preprocessor()
    const output = preprocessor.preprocess(htmltree, assets, options)
    htmltree = output.tree
    const styles = output.styles
      ? output.styles.map(style => style.children[0] && style.children[0].content).filter(Boolean)
      : []

    assets.forEach(asset => {
      if (asset.type === 'COMPONENT' && asset.path.endsWith('.css')) {
        const css = transpileCSS(asset.source)
        styles.push(css)
      }
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
            stack,
            errors,
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
        await collect({ source, tree, fragment, assets, variables, filters, components, styles, scripts, translations, plugins, stack, store, depth, options, promises, errors, warnings, needles })
      })
      await Promise.all(promises)

      function replaceNeedleOrAppend (tree, { needle, tag, content }) {
        if (content) {
          const all = `<${tag}>${content}</${tag}>`
          if (needles[needle]) {
            const node = tree.first(`Literal[value=__NEEDLE_${needle.toUpperCase()}__]`)
            node.value = all
          } else {
            tree.append(getTemplateAssignmentExpression(TEMPLATE_VARIABLE, getLiteral(all)))
          }
        } else {
          tree.replace((node) => {
            if (node.type === 'ExpressionStatement' &&
              node.expression.type === 'AssignmentExpression' &&
              node.expression.right.type === 'Literal' &&
              node.expression.right.value === `__NEEDLE_${needle.toUpperCase()}__`) {
              return null
            }
            return node
          })
        }
      }

      const style = unique(styles).join(' ')
      replaceNeedleOrAppend(tree, { needle: 'head', tag: 'style', content: style })

      const script = concatenateScripts(scripts)
      replaceNeedleOrAppend(tree, { needle: 'body', tag: 'script', content: script })

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
