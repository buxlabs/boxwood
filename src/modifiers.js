const AbstractSyntaxTree = require('@buxlabs/ast')
const utils = require('@buxlabs/utils')

module.exports = {
  getModifier (modifier) {
    const tree = new AbstractSyntaxTree(modifier)
    const node = tree.body()[0].expression
    const name = node.type === 'CallExpression' ? node.callee.name : node.name
    const method = utils.string[name] || utils.math[name] || utils.json[name]
    if (!method) return null
    const leaf = new AbstractSyntaxTree(method.toString())
    const fn = leaf.body()[0]
    fn.id.name = name
    return fn
  }
}