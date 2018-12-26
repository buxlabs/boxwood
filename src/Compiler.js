const AbstractSyntaxTree = require('abstract-syntax-tree')
const walk = require('himalaya-walk')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./factory')
const collect = require('./collect')
const { getFilter } = require('./filters')
const { array: { unique } } = require('pure-utilities')
const Parser = require('./Parser')
const Analyzer = require('./Analyzer')
const Optimizer = require('./Optimizer')
const Statistics = require('./Statistics')

async function render (htmltree, options) {
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
  const store = {}
  const translations = {}
  const scopes = []
  const promises = []
  const errors = []
  let depth = 0
  tree.append(getTemplateVariableDeclaration(TEMPLATE_VARIABLE))
  walk(htmltree, async fragment => {
    await collect(tree, fragment, variables, filters, components, statistics, translations, scopes, store, depth, options, promises, errors)
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
  return { tree, statistics, errors }
}

function wrap (template, rescue) {
  const tree = new AbstractSyntaxTree('')
  tree.append({
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: template.body
    },
    handler: {
      type: 'CatchClause',
      param: {
        type: 'Identifier',
        name: 'exception'
      },
      body: {
        type: 'BlockStatement',
        body: rescue.body
      }
    }
  })
  return tree
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
  async transform ({ template, rescue }) {
    return Promise.all([
      render(template, this.options),
      render(rescue, this.options)
    ])
  }
  generate ({ template, rescue }) {
    let program, statistics, errors
    if (rescue) {
      program = wrap(template.tree, rescue.tree)
    } else {
      program = template.tree
    }
    if (this.options.statistics) {
      if (rescue) {
        statistics = template.statistics.merge(rescue.statistics).serialize()
      } else {
        statistics = template.statistics.serialize()
      }
    }
    if (rescue) {
      errors = template.errors.concat(rescue.errors)
    } else {
      errors = template.errors
    }

    const analyzer = new Analyzer(program)
    const params = analyzer.params()
    const optimizer = new Optimizer(program)
    optimizer.optimize()
    const compiled = new Function(`return function render(${params}) {\n${program.source}}`)() // eslint-disable-line
    return { template: compiled, statistics, errors }
  }
}

module.exports = Compiler
