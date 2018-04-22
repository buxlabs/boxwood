const { parse, walk } = require('./src/parser')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')

module.exports = {
  render () {},
  compile (source) {
    const htmltree = parse(source)
    const tree = new AbstractSyntaxTree('')
    const variables = [{
      name: TEMPLATE_VARIABLE, depth: 0
    }, {
      name: OBJECT_VARIABLE, depth: 0
    }, {
      name: ESCAPE_VARIABLE, depth: 0
    }]
    tree.append(getTemplateVariableDeclaration())
    walk(htmltree, fragment => {
      collect(tree, fragment, variables)
    })
    tree.append(getTemplateReturnStatement())
    const body = tree.toString()
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
