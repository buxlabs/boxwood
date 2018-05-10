const { parse, walk } = require('./src/parser')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')
const utils = require('@buxlabs/utils')

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
    modifiers.forEach(modifier => {
      if (utils.string[modifier]) {
        const x = new AbstractSyntaxTree(utils.string[modifier].toString())
        const fn = x.body()[0]
        fn.id.name = modifier
        tree.prepend(fn)
      }
    })
    tree.append(getTemplateReturnStatement())
    const body = tree.toString()
    console.log(body)
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
