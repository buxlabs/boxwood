const { parse, walk } = require('./src/parser')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')
const utils = require('@buxlabs/utils')
const { getModifier } = require('./src/modifiers')

module.exports = {
  render () {},
  compile (source) {
    const htmltree = parse(source)
    const tree = new AbstractSyntaxTree('')
    const variables = [
      TEMPLATE_VARIABLE,
      OBJECT_VARIABLE,
      ESCAPE_VARIABLE
    ]
    const modifiers = []
    tree.append(getTemplateVariableDeclaration())
    walk(htmltree, fragment => {
      collect(tree, fragment, variables, modifiers)
    })
    modifiers.forEach(name => {
      const modifier = getModifier(name)
      if (modifier) {
        tree.prepend(modifier)
      }
    })
    tree.append(getTemplateReturnStatement())
    const body = tree.toString()
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
