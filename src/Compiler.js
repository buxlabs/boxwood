const AbstractSyntaxTree = require('abstract-syntax-tree')
const { parse } = require('himalaya')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./factory')
const collect = require('./collect')
const { getModifier } = require('./modifiers')
const { array: { unique } } = require('pure-utilities')
const Statistics = require('./Statistics')

function render (htmltree, options) {
  const tree = new AbstractSyntaxTree('')
  const variables = [
    TEMPLATE_VARIABLE,
    OBJECT_VARIABLE,
    ESCAPE_VARIABLE
  ].concat(GLOBAL_VARIABLES)
  const modifiers = []
  const components = []
  const promises = []
  const statistics = new Statistics()
  const store = {}
  const translations = {}
  let depth = 0
  tree.append(getTemplateVariableDeclaration())
  walk(htmltree, fragment => {
    collect(tree, fragment, variables, modifiers, components, statistics, translations, store, depth, options, promises)
  })
  return Promise.all(promises)
    .then(() => {
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
    })
}

function wrap (template, rescue) {
  const tree = new AbstractSyntaxTree('')
  tree.append({
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: template.body()
    },
    handler: {
      type: 'CatchClause',
      param: {
        type: 'Identifier',
        name: 'exception'
      },
      body: {
        type: 'BlockStatement',
        body: rescue.body()
      }
    }
  })
  return tree
}

class Compiler {
  constructor (options) {
    this.options = Object.assign({
      inline: [],
      compilers: {}
    }, options)
  }
  parse (source) {
    let template, rescue
    if (source.includes('<rescue>') && source.includes('</rescue>')) {
      const start = source.indexOf('<rescue>')
      const end = source.indexOf('</rescue>')
      const content = source.substring(start + '<rescue>'.length, end)
      rescue = parse(content)
      source = source.substring(0, start) + source.substring(end, source.length)
    }
    template = parse(source)
    return { template, rescue }
  }
  transform ({ template, rescue }) {
    const promises = []
    promises.push(render(template, this.options))
    if (rescue) {
      promises.push(render(rescue, this.options))
    }
    return Promise.all(promises)
  }
  generate ({ template, rescue }) {
    const statistics = template.statistics
    let program = template.tree
    if (rescue) {
      program = wrap(template.tree, rescue.tree)
      statistics.merge(rescue.statistics)
    }
    const code = new Function(`return function render(${OBJECT_VARIABLE}, ${ESCAPE_VARIABLE}) {\n${program.toString()}}`)()
    return { code, statistics: this.options.statistics ? statistics.serialize() : null }
  }
}

module.exports = Compiler
