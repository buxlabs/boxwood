const { parse, walk } = require('./src/parser')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')

module.exports = {
  render () {},
  compile (source) {
    const tree = parse(source)
    const ast = new AbstractSyntaxTree('')
    const variables = [TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE]
    ast.append(getTemplateVariableDeclaration())
    walk(tree, fragment => {
      collect(ast, fragment, variables)
    })
    ast.append(getTemplateReturnStatement())
    const body = ast.toString()
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
