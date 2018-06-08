const AbstractSyntaxTree = require('abstract-syntax-tree')
const { parse, walk } = require('./src/parser')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE, GLOBAL_VARIABLES } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')
const { getModifier } = require('./src/modifiers')

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
  const store = {}
  tree.append(getTemplateVariableDeclaration())
  walk(htmltree, fragment => {
    collect(tree, fragment, variables, modifiers, components, store, options)
  })
  modifiers.forEach(name => {
    const modifier = getModifier(name)
    if (modifier) {
      tree.prepend(modifier)
    }
  })
  tree.append(getTemplateReturnStatement())
  return tree
}

module.exports = {
  render,
  compile (source, options) {
    const rescue = {}
    if (source.includes('<rescue>') && source.includes('</rescue>')) {
      const start = source.indexOf('<rescue>')
      const end = source.indexOf('</rescue>')
      rescue.content = source.substring(start + '<rescue>'.length, end)
      source = source.substring(0, start) + source.substring(end, source.length)
      rescue.tree = render(rescue.content)
    }
    let program = render(source, options)
    if (rescue.tree) {
      const tree = new AbstractSyntaxTree('')
      tree.append({
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
      program = tree
    }
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, program.toString()) // eslint-disable-line
  }
}
