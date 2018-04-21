const { parse, walk } = require('./src/parser')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')

module.exports = {
  render () {},
  compile (source) {
    const tree = parse(source)
    const start = new AbstractSyntaxTree('')
    const end = new AbstractSyntaxTree('')
    const variables = [TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE]
    start.append(getTemplateVariableDeclaration())
    walk(tree, fragment => {
      collect(start, end, fragment, variables)
    })
    end.append(getTemplateReturnStatement())
    const body = start.toString() + end.toString()
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
