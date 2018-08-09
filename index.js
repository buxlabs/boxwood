const AbstractSyntaxTree = require('abstract-syntax-tree')
const { parse } = require('himalaya')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')
const { getModifier } = require('./src/modifiers')
const { array: { unique } } = require('pure-utilities')

function getDefaultOptions (options) {
  return Object.assign({
    inline: []
  }, options)
}

function render (source, options) {
  const htmltree = parse(source)
  const tree = new AbstractSyntaxTree('')
  const variables = [
    TEMPLATE_VARIABLE,
    OBJECT_VARIABLE,
    ESCAPE_VARIABLE
  ].concat(GLOBAL_VARIABLES)
  const modifiers = []
  const components = []
  const statistics = {
    components: [],
    partials: [],
    svgs: [],
    images: [],
    scripts: [],
    stylesheets: []
  }
  const store = {}
  const translations = {}
  let depth = 0
  tree.append(getTemplateVariableDeclaration())
  walk(htmltree, fragment => {
    collect(tree, fragment, variables, modifiers, components, statistics, translations, store, depth, options)
  })
  const used = []
  unique(modifiers).forEach(name => {
    const modifier = getModifier(name, translations, options)
    if (modifier && !used.includes(modifier.id.name)) {
      tree.prepend(modifier)
      used.push(modifier.id.name)
    }
  })
  tree.append(getTemplateReturnStatement())
  return { tree, components, statistics }
}

// TODO pure-utilities unique should work for objects
function uniq (array) {
  return Array.from(new Set(array.map(item => JSON.stringify(item)))).map(JSON.parse)
}

module.exports = {
  render,
  compile (source, options = {}) {
    options = getDefaultOptions(options)
    const rescue = {}
    if (source.includes('<rescue>') && source.includes('</rescue>')) {
      const start = source.indexOf('<rescue>')
      const end = source.indexOf('</rescue>')
      rescue.content = source.substring(start + '<rescue>'.length, end)
      source = source.substring(0, start) + source.substring(end, source.length)
      const { tree, statistics } = render(rescue.content, options)
      rescue.tree = tree
      rescue.statistics = statistics
    }
    const { tree, statistics } = render(source, options)
    let program = tree
    if (rescue.tree) {
      const ast = new AbstractSyntaxTree('')
      ast.append({
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: program.body()
        },
        handler: {
          type: 'CatchClause',
          param: {
            type: 'Identifier',
            name: 'exception'
          },
          body: {
            type: 'BlockStatement',
            body: rescue.tree.body()
          }
        }
      })
      program = ast
      statistics.components = statistics.components.concat(rescue.statistics.components)
      statistics.partials = statistics.partials.concat(rescue.statistics.partials)
      statistics.svgs = statistics.svgs.concat(rescue.statistics.svgs)
      statistics.images = statistics.images.concat(rescue.statistics.images)
      statistics.scripts = statistics.scripts.concat(rescue.statistics.scripts)
      statistics.stylesheets = statistics.stylesheets.concat(rescue.statistics.stylesheets)
    }
    const code = new Function(`return function render(${OBJECT_VARIABLE}, ${ESCAPE_VARIABLE}) {\n${program.toString()}}`)()
    if (options.statistics) {
      const components = uniq(statistics.components)
      const partials = uniq(statistics.partials)
      const svgs = uniq(statistics.svgs)
      const images = uniq(statistics.images)
      const scripts = uniq(statistics.scripts)
      const stylesheets = uniq(statistics.stylesheets)
      return {
        code,
        statistics: {
          components,
          partials,
          svgs,
          images,
          scripts,
          stylesheets,
          assets: [].concat(
            components.map(item => item.path),
            partials.map(item => item.path),
            svgs.map(item => item.path),
            images.map(item => item.path),
            scripts.map(item => item.path),
            stylesheets.map(item => item.path)
          )
        }
      }
    }
    return code
  }
}
